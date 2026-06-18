"use client";

/**
 * Route guard components and hooks for auth-protected routes.
 *
 * - RequireAuth: wraps children, redirects to /login if not authenticated
 * - RequireRole: wraps children, shows forbidden if role insufficient
 * - useRoleGuard: hook that checks role permissions
 */

import { useMemo } from "react";
import type { Role } from "../domain/entities";
import { hasPermission } from "../domain/value-objects";
import { useAuth } from "./auth-provider";

// ---------------------------------------------------------------------------
// useRoleGuard hook
// ---------------------------------------------------------------------------

export interface RoleGuardResult {
  /** Whether the current user's role meets the requirement. */
  allowed: boolean;
  /** If not allowed, the reason (e.g., "Insufficient role: requires admin"). */
  reason?: string;
}

/**
 * Check if the current user has the required role level.
 *
 * Returns an object with `allowed` (boolean) and optional `reason` (string).
 * Does NOT redirect — the consuming component decides what to do.
 */
export function useRoleGuard(requiredRole: Role): RoleGuardResult {
  const { role, isAuthenticated } = useAuth();

  return useMemo(() => {
    if (!isAuthenticated) {
      return {
        allowed: false,
        reason: "Not authenticated",
      };
    }

    if (!role) {
      return {
        allowed: false,
        reason: "No role assigned",
      };
    }

    if (!hasPermission(role, requiredRole)) {
      return {
        allowed: false,
        reason: `Insufficient role: requires ${requiredRole}`,
      };
    }

    return { allowed: true };
  }, [role, requiredRole, isAuthenticated]);
}
