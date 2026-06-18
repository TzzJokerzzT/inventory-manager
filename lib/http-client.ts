/**
 * Re-export of the auth HTTP client for convenience.
 *
 * Import from here in application and presentation layers
 * instead of reaching into auth/infrastructure directly.
 */

export type { AuthEvent } from "./auth/infrastructure/http-client";
export { httpClient, onAuthEvent } from "./auth/infrastructure/http-client";
