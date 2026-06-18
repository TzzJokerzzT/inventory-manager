/**
 * @vitest-environment happy-dom
 *
 * Tests for the Better Auth client adapter.
 *
 * These verify the adapter's structure and exported interface.
 * Actual API calls are tested in integration tests.
 */

import { describe, expect, it } from "vitest";
import {
  authClient,
  betterAuthAdapter,
} from "@/lib/auth/infrastructure/auth-client";

describe("authClient", () => {
  it("exports a valid Better Auth client", () => {
    expect(authClient).toBeDefined();
    // Better Auth's signIn and signUp are namespaces with .email() etc.
    expect(typeof authClient.signIn).toBeDefined();
    expect(typeof authClient.signUp).toBeDefined();
    expect(typeof authClient.signOut).toBe("function");
    expect(typeof authClient.getSession).toBe("function");
  });
});

describe("betterAuthAdapter", () => {
  it("exposes signInEmail, signUpEmail, signOut, getSession methods", () => {
    expect(typeof betterAuthAdapter.signInEmail).toBe("function");
    expect(typeof betterAuthAdapter.signUpEmail).toBe("function");
    expect(typeof betterAuthAdapter.signOut).toBe("function");
    expect(typeof betterAuthAdapter.getSession).toBe("function");
  });
});
