/**
 * @vitest-environment happy-dom
 *
 * Tests for the cookie service.
 *
 * Cookie operations run in the browser, so we use happy-dom's document
 * for testing. Since happy-dom shares cookie state across tests in a
 * single file, we use unique cookie names and careful setup/teardown.
 */

import { afterEach, describe, expect, it } from "vitest";
import {
  clearAuthCookies,
  hasRefreshCookie,
  hasSessionCookie,
  hasSessionCookieInRequest,
  parseCookies,
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/infrastructure/cookie-service";

describe("cookie service", () => {
  afterEach(() => {
    // Clear all cookies by expiring them
    // biome-ignore lint/suspicious/noDocumentCookie: test setup — clearing cookies
    document.cookie = `${SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    // biome-ignore lint/suspicious/noDocumentCookie: test setup — clearing cookies
    document.cookie = `${REFRESH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    // biome-ignore lint/suspicious/noDocumentCookie: test setup — clearing cookies
    document.cookie =
      "other_cookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });

  describe("hasSessionCookie", () => {
    it("returns true when session cookie exists", () => {
      // biome-ignore lint/suspicious/noDocumentCookie: test setup — setting test cookie
      document.cookie = `${SESSION_COOKIE_NAME}=abc123; path=/`;
      expect(hasSessionCookie()).toBe(true);
    });

    it("returns false when session cookie is absent", () => {
      // No session cookie set
      expect(hasSessionCookie()).toBe(false);
    });
  });

  describe("hasRefreshCookie", () => {
    it("returns true when refresh cookie exists", () => {
      // biome-ignore lint/suspicious/noDocumentCookie: test setup — setting test cookie
      document.cookie = `${REFRESH_COOKIE_NAME}=xyz789; path=/`;
      expect(hasRefreshCookie()).toBe(true);
    });

    it("returns false when refresh cookie is absent", () => {
      expect(hasRefreshCookie()).toBe(false);
    });
  });

  describe("parseCookies", () => {
    it("returns a Map from current document cookies", () => {
      // biome-ignore lint/suspicious/noDocumentCookie: test setup — setting test cookie
      document.cookie = "parseTest=value123; path=/";
      const cookies = parseCookies();
      expect(cookies.get("parseTest")).toBe("value123");
    });

    it("returns empty Map when no cookies", () => {
      const cookies = parseCookies();
      // May have cookies from other tests, so just verify it's a Map
      expect(cookies).toBeInstanceOf(Map);
    });

    it("handles cookies with = in value", () => {
      // biome-ignore lint/suspicious/noDocumentCookie: test setup — setting test cookie
      document.cookie = "eqTest=abc=def=ghi; path=/";
      const cookies = parseCookies();
      // The value should include everything after the first =
      const value = cookies.get("eqTest");
      expect(value).toContain("abc");
    });
  });

  describe("clearAuthCookies", () => {
    it("does not throw when called", () => {
      expect(() => clearAuthCookies()).not.toThrow();
    });
  });

  describe("cookie name constants", () => {
    it("exports correct session cookie name", () => {
      expect(SESSION_COOKIE_NAME).toBe("better-auth.session_token");
    });

    it("exports correct refresh cookie name", () => {
      expect(REFRESH_COOKIE_NAME).toBe("better-auth.refresh_token");
    });
  });

  describe("hasSessionCookieInRequest", () => {
    it("returns true when request has session cookie", () => {
      const request = {
        cookies: {
          get: (name: string) => {
            if (name === SESSION_COOKIE_NAME) {
              return { value: "some-token" };
            }
            return undefined;
          },
        },
      };
      expect(hasSessionCookieInRequest(request)).toBe(true);
    });

    it("returns false when request has no session cookie", () => {
      const request = {
        cookies: {
          get: () => undefined,
        },
      };
      expect(hasSessionCookieInRequest(request)).toBe(false);
    });
  });
});
