import { describe, expect, it } from "vitest";
import { validateLogin, validateRegister } from "@/lib/auth/domain/schemas";

describe("LoginSchema", () => {
  it("validates correct login data", () => {
    const result = validateLogin({
      email: "user@gmail.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = validateLogin({
      email: "",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = validateLogin({
      email: "not-an-email",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = validateLogin({
      email: "user@gmail.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("trims email whitespace", () => {
    const result = validateLogin({
      email: "  user@gmail.com  ",
      password: "secret",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.email).toBe("user@gmail.com");
    }
  });
});

describe("RegisterSchema", () => {
  it("validates correct registration data", () => {
    const result = validateRegister({
      email: "user@gmail.com",
      password: "password123",
      name: "John",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all allowed email domains", () => {
    const domains = ["hotmail.com", "gmail.com", "yahoo.com", "outlook.com"];
    for (const domain of domains) {
      const result = validateRegister({
        email: `user@${domain}`,
        password: "password123",
        name: "John",
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects disallowed email domains", () => {
    const result = validateRegister({
      email: "user@company.com",
      password: "password123",
      name: "John",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      // Find the email domain error
      const emailIssue = result.issues?.find(
        (issue) => issue.message === "Email domain not allowed",
      );
      expect(emailIssue).toBeDefined();
    }
  });

  it("rejects short passwords (less than 8 chars)", () => {
    const result = validateRegister({
      email: "user@gmail.com",
      password: "short",
      name: "John",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short names (less than 2 chars)", () => {
    const result = validateRegister({
      email: "user@gmail.com",
      password: "password123",
      name: "J",
    });
    expect(result.success).toBe(false);
  });

  it("trims name whitespace", () => {
    const result = validateRegister({
      email: "user@gmail.com",
      password: "password123",
      name: "  John Doe  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.name).toBe("John Doe");
    }
  });

  it("rejects invalid email format even with allowed domain substring", () => {
    const result = validateRegister({
      email: "not-valid",
      password: "password123",
      name: "John",
    });
    expect(result.success).toBe(false);
  });
});

describe("LoginSchema direct validation", () => {
  it("can be used with v.safeParse", () => {
    const result = validateLogin({
      email: "test@hotmail.com",
      password: "any",
    });
    expect(result.success).toBe(true);
  });
});
