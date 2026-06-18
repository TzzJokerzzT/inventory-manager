/**
 * Cookie service for reading auth state from the browser.
 *
 * Since the backend uses httpOnly cookies for JWTs, we can't read
 * their values directly. Instead, we check for cookie existence
 * to determine if a session token is present (used by proxy.ts
 * for optimistic route protection).
 *
 * In client components, this module provides helpers for detecting
 * auth state from cookies. The actual session validation happens
 * via API calls (GetSessionUseCase).
 */

export const SESSION_COOKIE_NAME = "better-auth.session_token";
export const REFRESH_COOKIE_NAME = "better-auth.refresh_token";

/**
 * Check if a session cookie exists in the browser.
 * Uses document.cookie (client-side only).
 *
 * Returns true if the session cookie is present, false otherwise.
 * This is an optimistic check — the cookie may be expired.
 * Full validation happens server-side.
 */
export function hasSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
}

/**
 * Check if a refresh cookie exists in the browser.
 * Uses document.cookie (client-side only).
 */
export function hasRefreshCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith(`${REFRESH_COOKIE_NAME}=`));
}

/**
 * Parse all cookies into a Map for easy lookup.
 * Client-side only.
 */
export function parseCookies(): Map<string, string> {
  const cookies = new Map<string, string>();

  if (typeof document === "undefined") return cookies;

  for (const cookie of document.cookie.split(";")) {
    const trimmed = cookie.trim();
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      const key = trimmed.slice(0, eqIndex);
      const value = trimmed.slice(eqIndex + 1);
      cookies.set(key, value);
    }
  }

  return cookies;
}

/**
 * Check if a session cookie exists in a Request (server-side).
 * Used by proxy.ts for Next.js 16 route protection.
 */
export function hasSessionCookieInRequest(request: {
  cookies: { get: (name: string) => { value: string } | undefined };
}): boolean {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value !== undefined;
}

/**
 * Clear all auth cookies by setting them to expire in the past.
 * Called during logout to ensure client-side state is fully cleared.
 */
export function clearAuthCookies(): void {
  if (typeof document === "undefined") return;

  const pastDate = "Thu, 01 Jan 1970 00:00:00 GMT";

  // Clear by setting expiry to past (works for non-httpOnly cookies)
  // httpOnly cookies can only be cleared by the server
  // biome-ignore lint/suspicious/noDocumentCookie: intentional — clearing cookies on logout
  document.cookie = `${SESSION_COOKIE_NAME}=; expires=${pastDate}; path=/`;
  // biome-ignore lint/suspicious/noDocumentCookie: intentional — clearing cookies on logout
  document.cookie = `${REFRESH_COOKIE_NAME}=; expires=${pastDate}; path=/`;
}
