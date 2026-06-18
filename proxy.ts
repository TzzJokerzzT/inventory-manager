/**
 * Next.js 16 proxy for optimistic cookie-based route protection.
 *
 * This middleware-like module performs lightweight checks:
 * - Redirects unauthenticated users from protected routes to /login
 * - Redirects authenticated users away from /login and /register to /dashboard
 * - In mock auth mode (NEXT_PUBLIC_MOCK_AUTH=true), skips cookie checks entirely
 *   since authentication is managed client-side via Zustand
 *
 * Full session validation happens in the protected layout (client-side).
 * This is a fast, optimistic layer — it only checks cookie existence,
 * NOT cookie validity or expiry.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

/** When true, auth is managed client-side — bypass cookie checks. */
const isMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

/** Routes that unauthenticated users can access. */
const PUBLIC_PATHS = ["/login", "/register", "/"];

/** Prefix for protected routes that require authentication. */
const PROTECTED_PREFIX = "/dashboard";

/**
 * Optimistic cookie-based route protection.
 *
 * Checks for session cookie existence and redirects based on
 * authentication status. Does NOT validate cookie contents.
 * In mock mode, allows all routes through — auth is checked
 * client-side by the protected layout.
 */
export function proxy(request: NextRequest): NextResponse {
  // In mock auth mode, let all routes through — the protected layout
  // handles client-side auth checks via Zustand
  if (isMockAuth) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  // Authenticated user on auth page → redirect to dashboard
  if (hasSessionCookie && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated user on protected route → redirect to login
  if (!hasSessionCookie && pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

/** Matcher config to exclude Next.js internals and API auth routes. */
export const proxyConfig = {
  matcher: ["/((?!_next|favicon.ico|api/auth).*)"],
};
