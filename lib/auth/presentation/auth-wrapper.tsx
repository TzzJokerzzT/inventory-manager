"use client";

/**
 * Auth wrapper component that creates the IAuthRepository implementation
 * and provides it to AuthProvider.
 *
 * This is a client component that bridges the server-rendered root layout
 * with the client-side AuthProvider + HTTP client infrastructure.
 */

import { AuthProvider } from "@/lib/auth/presentation/auth-provider";
import { httpClient } from "@/lib/http-client";
import type { IAuthRepository } from "@/lib/auth/domain/repository";
import type {
  LoginCredentials,
  RegistrationData,
  Session,
  User,
} from "@/lib/auth/domain/entities";

/**
 * IAuthRepository implementation using the Axios HTTP client.
 *
 * This adapter connects the domain interface to the backend API
 * via the pre-configured httpClient instance.
 */
const authRepository: IAuthRepository = {
  async login(credentials: LoginCredentials): Promise<Session> {
    const response = await httpClient.post("/api/auth/login", credentials);
    return response.data;
  },

  async register(data: RegistrationData): Promise<User> {
    const response = await httpClient.post("/api/auth/register", data);
    return response.data;
  },

  async logout(): Promise<void> {
    await httpClient.post("/api/auth/logout");
  },

  async getSession(): Promise<Session | null> {
    try {
      const response = await httpClient.get("/api/auth/session");
      return response.data;
    } catch {
      return null;
    }
  },

  async refreshSession(): Promise<Session> {
    const response = await httpClient.post("/api/auth/refresh");
    return response.data;
  },
};

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  return <AuthProvider repository={authRepository}>{children}</AuthProvider>;
}
