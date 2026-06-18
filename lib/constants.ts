/**
 * Auth constants used across the application.
 *
 * Centralized here to avoid duplication between infrastructure
 * and domain/presentation layers.
 */

/** Allowed email domains for self-service registration. */
export const ALLOWED_EMAIL_DOMAINS = [
  "hotmail.com",
  "gmail.com",
  "yahoo.com",
  "outlook.com",
] as const;

/** Type for allowed email domain strings. */
export type AllowedEmailDomain = (typeof ALLOWED_EMAIL_DOMAINS)[number];

/** Role hierarchy: higher number = more permissions. */
export const ROLE_HIERARCHY: Record<string, number> = {
  admin: 3,
  operador: 2,
  solo_lectura: 1,
} as const;

/** Session timeout constants (in milliseconds). */
export const SESSION_TIMEOUTS = {
  /** Inactivity timeout: 30 minutes. */
  INACTIVITY_MS: 30 * 60 * 1000,
  /** Warning before inactivity expiry: 5 minutes. */
  INACTIVITY_WARNING_MS: 5 * 60 * 1000,
  /** Absolute session lifetime: 7 days. */
  ABSOLUTE_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000,
} as const;

/** Cookie names used by Better Auth / backend. */
export const SESSION_COOKIE_NAME = "better-auth.session_token";
export const REFRESH_COOKIE_NAME = "better-auth.refresh_token";
