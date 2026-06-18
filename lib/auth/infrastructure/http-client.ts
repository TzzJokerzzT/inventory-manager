/**
 * Axios HTTP client singleton for the referral-creator app.
 *
 * Creates a pre-configured Axios instance with:
 * - Base URL from NEXT_PUBLIC_API_URL env var
 * - Request interceptor: adds Authorization header if token exists
 * - Response interceptor: handles 401s with refresh lock mechanism
 *
 * Refresh lock ensures only one refresh request is in-flight at a time.
 * Concurrent 401s queue up and replay after the single refresh completes.
 */

import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

/** Base URL for the backend API. Falls back to localhost:3001 in dev. */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Cookie name used by Better Auth / backend for session tokens. */
export const SESSION_COOKIE_NAME = "better-auth.session_token";

/** Cookie name for the refresh token. */
export const REFRESH_COOKIE_NAME = "better-auth.refresh_token";

/**
 * Events emitted by the HTTP client for external subscribers.
 * The auth layer listens to these to trigger UI updates (e.g., expiry modal).
 */
export type AuthEvent =
  | { type: "session_expired" }
  | { type: "refresh_failed"; error: Error }
  | { type: "refresh_success" };

type AuthEventCallback = (event: AuthEvent) => void;

/** Subscription management for auth events. */
const authEventListeners = new Set<AuthEventCallback>();

/**
 * Subscribe to auth events (session_expired, refresh_failed, refresh_success).
 * Returns an unsubscribe function.
 */
export function onAuthEvent(callback: AuthEventCallback): () => void {
  authEventListeners.add(callback);
  return () => {
    authEventListeners.delete(callback);
  };
}

function emitAuthEvent(event: AuthEvent): void {
  for (const listener of authEventListeners) {
    listener(event);
  }
}

/**
 * Refresh lock mechanism.
 *
 * When a 401 is received, we attempt to refresh the token. If another 401
 * arrives while a refresh is already in progress, it waits for the same
 * refresh to complete instead of firing a second one.
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

function processQueue(token: string | null, error: Error | null): void {
  for (const { resolve, reject } of failedQueue) {
    if (token) {
      resolve(token);
    } else {
      reject(error ?? new Error("Token refresh failed"));
    }
  }
  failedQueue = [];
}

/** Axios instance configured for the auth API. */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Response interceptor for handling 401 Unauthorized responses.
 *
 * When a 401 is received:
 * 1. If not already refreshing, start a refresh request to POST /api/auth/refresh
 * 2. If already refreshing, queue the failed request to replay after refresh completes
 * 3. On refresh success: replay all queued requests with the new session
 * 4. On refresh failure: reject all queued requests, emit session_expired event
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 responses
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry if this is already a retry or if it's the refresh endpoint itself
    if (
      originalRequest._retry ||
      originalRequest.url?.includes("/api/auth/refresh")
    ) {
      // Refresh endpoint itself failed — session is truly expired
      emitAuthEvent({ type: "session_expired" });
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(httpClient(originalRequest)),
          reject: (err: Error) => reject(err),
        });
      });
    }

    isRefreshing = true;

    try {
      await httpClient.post("/api/auth/refresh");
      // Refresh succeeded — replay all queued requests
      processQueue("refreshed", null);
      emitAuthEvent({ type: "refresh_success" });
      return httpClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed — reject all queued requests
      const error =
        refreshError instanceof Error
          ? refreshError
          : new Error(String(refreshError));
      processQueue(null, error);
      emitAuthEvent({ type: "refresh_failed", error });
      emitAuthEvent({ type: "session_expired" });
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
