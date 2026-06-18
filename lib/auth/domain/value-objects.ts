/**
 * Auth domain value objects.
 *
 * These encapsulate business rules and validation constraints.
 * Framework-agnostic — no imports from infrastructure or presentation.
 */

import type { Role } from "./entities";

/** Role hierarchy: higher number = more permissions. */
export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 3,
  operador: 2,
  solo_lectura: 1,
} as const;

/** All valid roles as a readonly array for iteration. */
export const VALID_ROLES: readonly Role[] = [
  "admin",
  "operador",
  "solo_lectura",
] as const;

/** Default role assigned on self-service registration. */
export const DEFAULT_ROLE: Role = "solo_lectura";

/**
 * Check if `role` meets or exceeds the `required` role level.
 * Uses ROLE_HIERARCHY for comparison.
 */
export function hasPermission(role: Role, required: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[required];
}

/**
 * Check if a string is a valid Role value.
 */
export function isValidRole(value: string): value is Role {
  return VALID_ROLES.includes(value as Role);
}

/** Allowed email domains for self-service registration. */
export const ALLOWED_EMAIL_DOMAINS = [
  "hotmail.com",
  "gmail.com",
  "yahoo.com",
  "outlook.com",
] as const;

/** Type for allowed email domain strings. */
export type AllowedEmailDomain = (typeof ALLOWED_EMAIL_DOMAINS)[number];

/**
 * Extract the domain from an email address.
 * Returns empty string if the email has no @ sign.
 */
export function extractEmailDomain(email: string): string {
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) return "";
  return email.slice(atIndex + 1).toLowerCase();
}

/**
 * Check if an email's domain is in the allowed whitelist.
 */
export function isAllowedEmailDomain(email: string): boolean {
  const domain = extractEmailDomain(email);
  return ALLOWED_EMAIL_DOMAINS.some(
    (allowed) => allowed.toLowerCase() === domain,
  );
}

/** Session timeout constants (in milliseconds). */
export const SESSION_TIMEOUTS = {
  /** Inactivity timeout: 30 minutes */
  INACTIVITY_MS: 30 * 60 * 1000,
  /** Warning before inactivity expiry: 5 minutes */
  INACTIVITY_WARNING_MS: 5 * 60 * 1000,
  /** Absolute session lifetime: 7 days */
  ABSOLUTE_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000,
} as const;
