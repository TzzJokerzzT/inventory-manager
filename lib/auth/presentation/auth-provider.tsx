"use client";

/**
 * AuthProvider — React context bridge for the Zustand auth store.
 *
 * This component initializes auth state on mount by checking for an
 * existing session (via cookie existence or API call), subscribes to
 * auth events from the HTTP client (401 → refresh or expire), and
 * provides auth state + actions to children via React Context.
 *
 * Consumed by the `useAuth()` hook.
 */

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { onAuthEvent } from "@/lib/http-client";
import type {
  LoginCredentials,
  RegistrationData,
  Role,
  User,
} from "../domain/entities";
import type { IAuthRepository } from "../domain/repository";
import { type AuthStore, createAuthStore } from "./auth-store";

// ---------------------------------------------------------------------------
// Auth context type
// ---------------------------------------------------------------------------

export interface AuthContextValue {
  /** Currently authenticated user, or null. */
  user: AuthStore["user"];
  /** Current session, or null. */
  session: AuthStore["session"];
  /** User role derived from session. */
  role: AuthStore["role"];
  /** True when a session exists and user is loaded. */
  isAuthenticated: AuthStore["isAuthenticated"];
  /** True while an auth operation is in progress. */
  isLoading: AuthStore["isLoading"];
  /** Error message from the last failed auth operation. */
  error: AuthStore["error"];
  /** Authenticate with email/password. */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Register a new account. Returns the created user (does not auto-login). */
  register: (data: RegistrationData) => Promise<User>;
  /** Logout and clear all auth state. */
  logout: () => Promise<void>;
  /** Refresh the current session. */
  refreshSession: () => Promise<void>;
  /** Check if current user has the required role level. */
  checkPermission: (requiredRole: Role) => boolean;
  /** Clear the current error. */
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

AuthContext.displayName = "AuthContext";

// ---------------------------------------------------------------------------
// Provider props
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  /** Repository implementation for auth operations. */
  repository: IAuthRepository;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------

export function AuthProvider({ repository, children }: AuthProviderProps) {
  // Create the store once per provider instance
  const storeRef = useRef<ReturnType<typeof createAuthStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createAuthStore({ repository });
  }
  const store = storeRef.current;

  // Auth event subscription — listens for session_expiry from httpClient
  useEffect(() => {
    const unsubscribe = onAuthEvent((event) => {
      if (event.type === "session_expired") {
        // Refresh failed — clear all state
        store.getState().reset();
      }
    });

    return unsubscribe;
  }, [store]);

  // Subscribe to store state changes and expose via context
  const state = store();
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      session: state.session,
      role: state.role,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login: state.login,
      register: state.register,
      logout: state.logout,
      refreshSession: state.refreshSession,
      checkPermission: state.checkPermission,
      clearError: state.clearError,
    }),
    [state],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Convenience hook for accessing auth state and actions.
 *
 * Must be used within an AuthProvider.
 * Throws if called outside of AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
