/**
 * Auth repository contract (interface).
 *
 * This is the domain port that infrastructure must implement.
 * Domain and application layers depend on this interface;
 * infrastructure provides concrete adapters.
 */

import type {
  LoginCredentials,
  RegistrationData,
  Session,
  User,
} from "./entities";

/**
 * Interface for authentication data access.
 * Implemented by infrastructure adapters (e.g., AuthHttpClient, BetterAuthAdapter).
 */
export interface IAuthRepository {
  /** Authenticate with email/password, return session. */
  login(credentials: LoginCredentials): Promise<Session>;

  /** Register a new user, return created user. */
  register(data: RegistrationData): Promise<User>;

  /** Invalidate the current session server-side and client-side. */
  logout(): Promise<void>;

  /** Fetch current session from backend. Returns null if no valid session. */
  getSession(): Promise<Session | null>;

  /** Refresh an expired access token using refresh cookie. */
  refreshSession(): Promise<Session>;
}
