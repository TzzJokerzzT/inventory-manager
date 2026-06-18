/**
 * Auth application use cases.
 *
 * These orchestrators implement business rules by coordinating between
 * domain entities and the repository interface. They are framework-agnostic —
 * no React, no Next.js, no Zustand imports.
 *
 * Dependency inversion: each use case receives its repository via constructor
 * so it can be tested with a mock and swapped without touching business logic.
 */

import type {
  LoginCredentials,
  RegistrationData,
  Role,
  Session,
  User,
} from "../domain/entities";
import type { IAuthRepository } from "../domain/repository";
import {
  hasPermission as domainHasPermission,
  isAllowedEmailDomain,
} from "../domain/value-objects";

// ---------------------------------------------------------------------------
// Domain-specific error types
// ---------------------------------------------------------------------------

/** Base class for all auth-related domain errors. */
export class AuthError extends Error {
  override readonly name = "AuthError";
  constructor(
    message: string,
    public readonly code: AuthErrorCode,
  ) {
    super(message);
  }
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "INVALID_EMAIL_DOMAIN"
  | "DUPLICATE_EMAIL"
  | "SESSION_EXPIRED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

/** Thrown when login credentials are rejected by the backend. */
export class InvalidCredentialsError extends AuthError {
  constructor(message = "Invalid email or password") {
    super(message, "INVALID_CREDENTIALS");
  }
}

/** Thrown when registration uses an email domain not in the whitelist. */
export class InvalidEmailDomainError extends AuthError {
  constructor(message = "Email domain not allowed") {
    super(message, "INVALID_EMAIL_DOMAIN");
  }
}

/** Thrown when registration targets an email that already exists. */
export class DuplicateEmailError extends AuthError {
  constructor(message = "An account with this email already exists") {
    super(message, "DUPLICATE_EMAIL");
  }
}

/** Thrown when a refresh token has expired or is invalid. */
export class SessionExpiredError extends AuthError {
  constructor(message = "Session has expired. Please log in again.") {
    super(message, "SESSION_EXPIRED");
  }
}

/** Thrown when a network request fails (5xx, timeout, etc.). */
export class NetworkError extends AuthError {
  constructor(message = "Service unavailable, try again later") {
    super(message, "NETWORK_ERROR");
  }
}

// ---------------------------------------------------------------------------
// Helper: classify unknown errors into typed domain errors
// ---------------------------------------------------------------------------

/**
 * Maps an unknown thrown value to the most appropriate AuthError.
 * If the value is already an AuthError it is returned unchanged.
 * Axios errors are classified by status code when available.
 */
export function classifyError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;

  // Axios-style error with a response status
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { status?: number } }).response;
    const status = response?.status;

    if (status === 401) return new InvalidCredentialsError();
    if (status === 403) return new SessionExpiredError();
    if (status === 409) return new DuplicateEmailError();
  }

  // Network-level error (no response at all)
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ((error as { code: string }).code === "ERR_NETWORK" ||
      (error as { code: string }).code === "ECONNREFUSED" ||
      (error as { code: string }).code === "ETIMEDOUT")
  ) {
    return new NetworkError();
  }

  if (error instanceof Error) {
    return new AuthError(error.message, "UNKNOWN_ERROR");
  }

  return new AuthError("An unexpected error occurred", "UNKNOWN_ERROR");
}

// ---------------------------------------------------------------------------
// Use Cases
// ---------------------------------------------------------------------------

/**
 * LoginUseCase — authenticates a user with email/password.
 *
 * Returns a Session on success.
 * Throws InvalidCredentialsError, NetworkError, or AuthError.
 */
export class LoginUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<Session> {
    try {
      return await this.repository.login(credentials);
    } catch (error: unknown) {
      throw classifyError(error);
    }
  }
}

/**
 * RegisterUseCase — registers a new user.
 *
 * Validates the email domain whitelist BEFORE calling the repository.
 * Returns the created User on success.
 * Throws InvalidEmailDomainError, DuplicateEmailError, NetworkError, or AuthError.
 */
export class RegisterUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(data: RegistrationData): Promise<User> {
    // Domain whitelist validation happens at the application layer
    // because it's a business rule, not a network concern.
    if (!isAllowedEmailDomain(data.email)) {
      throw new InvalidEmailDomainError();
    }

    try {
      return await this.repository.register(data);
    } catch (error: unknown) {
      throw classifyError(error);
    }
  }
}

/**
 * LogoutUseCase — invalidates the current session.
 *
 * Calls the repository to invalidate server-side and clear cookies.
 * Always clears client-side state regardless of server response.
 */
export class LogoutUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(): Promise<void> {
    try {
      await this.repository.logout();
    } catch {
      // Swallow errors on logout — we always clear client state regardless.
      // The session cookie will expire naturally if the server call fails.
    }
  }
}

/**
 * RefreshSessionUseCase — refreshes an expired access token.
 *
 * Returns an updated Session on success.
 * Throws SessionExpiredError if the refresh token is also expired.
 */
export class RefreshSessionUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(): Promise<Session> {
    try {
      return await this.repository.refreshSession();
    } catch (error: unknown) {
      throw classifyError(error);
    }
  }
}

/**
 * CheckPermissionUseCase — compares a user's role against a required role.
 *
 * Returns true if the user's role meets or exceeds the required role level.
 * This is a synchronous use case (no I/O).
 *
 * Note: This use case is pure domain logic and doesn't need a repository.
 * The constructor is empty for consistent DI pattern, but the `execute`
 * method only uses the `hasPermission` domain function.
 */
export class CheckPermissionUseCase {
  /**
   * @param userRole — the role of the current user
   * @param requiredRole — the minimum role required for the action/route
   * @returns true if userRole >= requiredRole in the hierarchy
   */
  execute(userRole: Role, requiredRole: Role): boolean {
    return domainHasPermission(userRole, requiredRole);
  }
}
