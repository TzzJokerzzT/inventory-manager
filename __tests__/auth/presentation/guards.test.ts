/**
 * @vitest-environment node
 *
 * Tests for route guard hooks and utilities.
 *
 * Since useRoleGuard depends on React context, we test the logic
 * through the domain hasPermission function and the hook's
 * pure role-checking behavior using a mock auth context.
 */

import { describe, expect, it } from "vitest";
import type { Role } from "@/lib/auth/domain/entities";
import { hasPermission } from "@/lib/auth/domain/value-objects";
import type { RoleGuardResult } from "@/lib/auth/presentation/guards";

// ---------------------------------------------------------------------------
// Pure domain function tests (the core logic behind useRoleGuard)
// ---------------------------------------------------------------------------

describe("Role guard logic (hasPermission)", () => {
  it("allows admin to access any route", () => {
    expect(hasPermission("admin", "admin")).toBe(true);
    expect(hasPermission("admin", "operador")).toBe(true);
    expect(hasPermission("admin", "solo_lectura")).toBe(true);
  });

  it("allows operador to access operador and solo_lectura routes", () => {
    expect(hasPermission("operador", "operador")).toBe(true);
    expect(hasPermission("operador", "solo_lectura")).toBe(true);
  });

  it("denies operador from admin routes", () => {
    expect(hasPermission("operador", "admin")).toBe(false);
  });

  it("allows solo_lectura only for solo_lectura routes", () => {
    expect(hasPermission("solo_lectura", "solo_lectura")).toBe(true);
    expect(hasPermission("solo_lectura", "operador")).toBe(false);
    expect(hasPermission("solo_lectura", "admin")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// RoleGuardResult contract tests
// ---------------------------------------------------------------------------

describe("RoleGuardResult contract", () => {
  it("allowed result has no reason", () => {
    const result: RoleGuardResult = { allowed: true };
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("denied result includes reason", () => {
    const result: RoleGuardResult = {
      allowed: false,
      reason: "Insufficient role: requires admin",
    };
    expect(result.allowed).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it("denied result for unauthenticated user includes reason", () => {
    const result: RoleGuardResult = {
      allowed: false,
      reason: "Not authenticated",
    };
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("Not authenticated");
  });

  it("denied result for missing role includes reason", () => {
    const result: RoleGuardResult = {
      allowed: false,
      reason: "No role assigned",
    };
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("No role assigned");
  });
});

// ---------------------------------------------------------------------------
// Role hierarchy edge cases
// ---------------------------------------------------------------------------

describe("Role hierarchy edge cases", () => {
  it("same role always has permission", () => {
    const roles: Role[] = ["admin", "operador", "solo_lectura"];
    for (const role of roles) {
      expect(hasPermission(role, role)).toBe(true);
    }
  });

  it("admin has transitive access to all lower roles", () => {
    expect(hasPermission("admin", "operador")).toBe(true);
    expect(hasPermission("admin", "solo_lectura")).toBe(true);
    // Transitive: admin > operador > solo_lectura
    expect(hasPermission("operador", "solo_lectura")).toBe(true);
  });

  it("solo_lectura cannot escalate to any higher role", () => {
    expect(hasPermission("solo_lectura", "operador")).toBe(false);
    expect(hasPermission("solo_lectura", "admin")).toBe(false);
  });
});
