import { describe, expect, it } from "vitest";
import {
  ALLOWED_EMAIL_DOMAINS,
  DEFAULT_ROLE,
  hasPermission,
  isAllowedEmailDomain,
  isValidRole,
  ROLE_HIERARCHY,
} from "@/lib/auth/domain/value-objects";

describe("ROLE_HIERARCHY", () => {
  it("maps all roles to numeric levels", () => {
    expect(ROLE_HIERARCHY.admin).toBe(3);
    expect(ROLE_HIERARCHY.operador).toBe(2);
    expect(ROLE_HIERARCHY.solo_lectura).toBe(1);
  });

  it("admin has the highest level", () => {
    const levels = Object.values(ROLE_HIERARCHY);
    expect(Math.max(...levels)).toBe(ROLE_HIERARCHY.admin);
  });
});

describe("hasPermission", () => {
  it("allows admin to access operador-level routes", () => {
    expect(hasPermission("admin", "operador")).toBe(true);
  });

  it("allows admin to access solo_lectura-level routes", () => {
    expect(hasPermission("admin", "solo_lectura")).toBe(true);
  });

  it("allows operador to access solo_lectura-level routes", () => {
    expect(hasPermission("operador", "solo_lectura")).toBe(true);
  });

  it("denies operador from admin-level routes", () => {
    expect(hasPermission("operador", "admin")).toBe(false);
  });

  it("denies solo_lectura from operador-level routes", () => {
    expect(hasPermission("solo_lectura", "operador")).toBe(false);
  });

  it("allows same-level access", () => {
    expect(hasPermission("operador", "operador")).toBe(true);
  });
});

describe("isValidRole", () => {
  it.each(["admin", "operador", "solo_lectura"] as const)(
    "returns true for valid role: %s",
    (role) => {
      expect(isValidRole(role)).toBe(true);
    },
  );

  it("returns false for invalid role strings", () => {
    expect(isValidRole("superadmin")).toBe(false);
    expect(isValidRole("")).toBe(false);
    expect(isValidRole("Admin")).toBe(false);
  });
});

describe("DEFAULT_ROLE", () => {
  it("is solo_lectura", () => {
    expect(DEFAULT_ROLE).toBe("solo_lectura");
  });
});

describe("email domain validation", () => {
  describe("isAllowedEmailDomain", () => {
    it.each(ALLOWED_EMAIL_DOMAINS)(
      "accepts emails from allowed domain: %s",
      (domain) => {
        expect(isAllowedEmailDomain(`user@${domain}`)).toBe(true);
      },
    );

    it("rejects emails from disallowed domains", () => {
      expect(isAllowedEmailDomain("user@company.com")).toBe(false);
      expect(isAllowedEmailDomain("user@evil.org")).toBe(false);
    });

    it("handles case-insensitively", () => {
      expect(isAllowedEmailDomain("user@Gmail.COM")).toBe(true);
      expect(isAllowedEmailDomain("user@HOTMAIL.COM")).toBe(true);
    });

    it("rejects emails without domain", () => {
      expect(isAllowedEmailDomain("user@")).toBe(false);
      expect(isAllowedEmailDomain("user")).toBe(false);
    });
  });
});
