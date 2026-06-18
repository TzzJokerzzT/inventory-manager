/**
 * @vitest-environment node
 *
 * Tests for the proxy.ts route matching logic.
 *
 * These tests validate the redirect behavior of the proxy function
 * without actually running the Next.js server.
 */

import { describe, expect, it } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/proxy";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

/** Helper to create a next request with optional cookies. */
function createRequest(pathname: string, options?: { hasCookie?: boolean }) {
  const url = `http://localhost:3000${pathname}`;
  const request = new NextRequest(url);

  if (options?.hasCookie) {
    request.cookies.set(SESSION_COOKIE_NAME, "test-session-token");
  }

  return request;
}

// ---------------------------------------------------------------------------
// Unauthenticated access to protected routes
// ---------------------------------------------------------------------------

describe("proxy — unauthenticated access", () => {
  it("redirects unauthenticated user from /dashboard to /login", () => {
    const request = createRequest("/dashboard", { hasCookie: false });
    const response = proxy(request);

    expect(response.status).toBe(307); // NextResponse.redirect uses 307
    expect(response.headers.get("location")).toContain("/login");
  });

  it("redirects unauthenticated user from /dashboard/settings to /login", () => {
    const request = createRequest("/dashboard/settings", { hasCookie: false });
    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("allows unauthenticated access to /login", () => {
    const request = createRequest("/login", { hasCookie: false });
    const response = proxy(request);

    // Should pass through (NextResponse.next)
    expect(response.status).toBe(200);
  });

  it("allows unauthenticated access to /register", () => {
    const request = createRequest("/register", { hasCookie: false });
    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it("allows unauthenticated access to root path", () => {
    const request = createRequest("/", { hasCookie: false });
    const response = proxy(request);

    expect(response.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Authenticated access to auth pages
// ---------------------------------------------------------------------------

describe("proxy — authenticated redirects", () => {
  it("redirects authenticated user from /login to /dashboard", () => {
    const request = createRequest("/login", { hasCookie: true });
    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  it("redirects authenticated user from /register to /dashboard", () => {
    const request = createRequest("/register", { hasCookie: true });
    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });
});

// ---------------------------------------------------------------------------
// Authenticated access to protected routes
// ---------------------------------------------------------------------------

describe("proxy — authenticated access", () => {
  it("allows authenticated user to access /dashboard", () => {
    const request = createRequest("/dashboard", { hasCookie: true });
    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it("allows authenticated user to access /dashboard/settings", () => {
    const request = createRequest("/dashboard/settings", { hasCookie: true });
    const response = proxy(request);

    expect(response.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// API routes pass through
// ---------------------------------------------------------------------------

describe("proxy — API routes", () => {
  it("allows unauthenticated access to API auth routes (not covered by proxy)", () => {
    // API auth routes are excluded by the matcher, so proxy won't be called
    // for them. But if somehow called, they should pass through.
    const request = createRequest("/api/auth/session", { hasCookie: false });
    // This is not prefixed with PROTECTED_PREFIX, so it passes through
    const response = proxy(request);
    expect(response.status).toBe(200);
  });
});
