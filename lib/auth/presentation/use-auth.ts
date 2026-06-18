/**
 * Re-export useAuth from the auth-provider module.
 *
 * This file provides a dedicated import path for the auth hook
 * so consumers don't need to know about the provider internals.
 *
 * Usage: import { useAuth } from "@/lib/auth/presentation/use-auth";
 */

export type { AuthContextValue } from "./auth-provider";
export { useAuth } from "./auth-provider";
