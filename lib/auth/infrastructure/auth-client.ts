/**
 * Better Auth client adapter.
 *
 * This is a thin wrapper around Better Auth's `createAuthClient`.
 * It provides type-safe React hooks and methods for auth operations,
 * but does NOT manage its own server-side database or sessions.
 *
 * The backend JWT system is the source of truth. This adapter
 * provides the client-side API surface.
 *
 * Key decisions:
 * - Zustand is the primary auth state store (Better Auth's useSession()
 *   won't work without a server DB).
 * - This client adapter is used for API calls and type definitions.
 * - Session fetching goes through httpClient (Axios) to the backend,
 *   NOT through Better Auth's built-in session management.
 */

import { createAuthClient } from "better-auth/react";
import type { User } from "../domain/entities";

/**
 * Better Auth client instance.
 *
 * Configured with the backend URL. The `customSessionPlugin` adds
 * the `role` field to the session user type.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

/**
 * Extended user type that includes the role field
 * from our custom session plugin.
 */
export interface AuthClientUser extends User {
  role: User["role"];
}

/**
 * Adapter that bridges Better Auth client methods with our domain IAuthRepository.
 *
 * This is intentionally thin — it delegates to the HTTP client for actual
 * network calls and uses Better Auth types for type safety.
 */
export const betterAuthAdapter = {
  /**
   * Sign in with email and password via Better Auth.
   * Returns session data from the backend.
   */
  async signInEmail(email: string, password: string) {
    const result = await authClient.signIn.email({
      email,
      password,
    });
    return result;
  },

  /**
   * Sign up with email, password, and name via Better Auth.
   */
  async signUpEmail(email: string, password: string, name: string) {
    const result = await authClient.signUp.email({
      email,
      password,
      name,
    });
    return result;
  },

  /**
   * Sign out via Better Auth client.
   */
  async signOut() {
    await authClient.signOut();
  },

  /**
   * Get the current session via Better Auth client.
   * NOTE: We prefer using httpClient GET /api/auth/session
   * directly in the application layer for full control.
   */
  async getSession() {
    return authClient.getSession();
  },
};
