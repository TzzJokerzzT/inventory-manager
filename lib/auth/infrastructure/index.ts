/**
 * Public API for the auth infrastructure layer.
 *
 * Infrastructure implements domain interfaces and provides
 * external adapters (HTTP client, auth client, cookie service).
 */

export type { AuthClientUser } from "./auth-client";
export { authClient, betterAuthAdapter } from "./auth-client";
export {
  clearAuthCookies,
  hasRefreshCookie,
  hasSessionCookie,
  hasSessionCookieInRequest,
  parseCookies,
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "./cookie-service";
export type { AuthEvent } from "./http-client";
export {
  httpClient,
  onAuthEvent,
  REFRESH_COOKIE_NAME as HTTP_REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME as HTTP_SESSION_COOKIE_NAME,
} from "./http-client";
