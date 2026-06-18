/**
 * Auth domain Valibot schemas.
 *
 * These schemas validate login, registration, and email constraints.
 * Valibot is used instead of Zod for smaller bundle size and better
 * tree-shaking.
 */

import * as v from "valibot";
import { ALLOWED_EMAIL_DOMAINS } from "./value-objects";

/**
 * Checks whether an email's domain is in the allowed whitelist.
 * Used as a Valibot custom validation check.
 */
function isDomainAllowed(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const atIndex = input.lastIndexOf("@");
  if (atIndex === -1) return false;
  const domain = input.slice(atIndex + 1).toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.some(
    (allowed) => allowed.toLowerCase() === domain,
  );
}

/** Schema for login form validation. */
export const LoginSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email("Invalid email format")),
  password: v.pipe(v.string(), v.minLength(1, "Password is required")),
});

/** Inferred TypeScript type from LoginSchema. */
export type LoginInput = v.InferOutput<typeof LoginSchema>;

/** Schema for registration form validation. */
export const RegisterSchema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.email("Invalid email format"),
    v.custom(isDomainAllowed, "Email domain not allowed"),
  ),
  password: v.pipe(
    v.string(),
    v.minLength(8, "Password must be at least 8 characters"),
  ),
  name: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(2, "Name must be at least 2 characters"),
  ),
});

/** Inferred TypeScript type from RegisterSchema. */
export type RegisterInput = v.InferOutput<typeof RegisterSchema>;

/**
 * Validate login credentials using Valibot's safeParse.
 * Returns typed result with success/failure state.
 */
export function validateLogin(data: unknown) {
  return v.safeParse(LoginSchema, data);
}

/**
 * Validate registration data using Valibot's safeParse.
 * Returns typed result with success/failure state.
 */
export function validateRegister(data: unknown) {
  return v.safeParse(RegisterSchema, data);
}
