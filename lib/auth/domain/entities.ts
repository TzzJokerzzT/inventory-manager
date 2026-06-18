/**
 * Auth domain entities.
 *
 * These types are framework-agnostic and define the core business objects
 * for authentication. They must NOT import from infrastructure or presentation.
 */

/** User roles with hierarchical permissions. */
export type Role = "admin" | "operador" | "solo_lectura";

/** Core user entity returned after authentication. */
export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: Role;
  readonly createdAt: string;
}

/** Credentials submitted during login. */
export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

/** Data submitted during registration. */
export interface RegistrationData {
  readonly email: string;
  readonly password: string;
  readonly name: string;
}

/** Current status of a user session. */
export type SessionStatus = "active" | "expired" | "idle";

/** Session entity containing user and expiry information. */
export interface Session {
  readonly user: User;
  readonly expiresAt: string;
  readonly lastActivity: number;
}

/** Authentication state managed by the Zustand store. */
export interface AuthState {
  readonly user: User | null;
  readonly role: Role | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
}
