/**
 * @vitest-environment node
 *
 * Tests for the Zustand auth store.
 *
 * Uses a mock IAuthRepository to verify state transitions for
 * login, register, logout, refresh, and permission checks.
 */

import { describe, expect, it, vi } from "vitest";
import {
  DuplicateEmailError,
  InvalidCredentialsError,
  InvalidEmailDomainError,
  SessionExpiredError,
} from "@/lib/auth/application/use-cases";
import type {
  LoginCredentials,
  RegistrationData,
  Session,
  User,
} from "@/lib/auth/domain/entities";
import type { IAuthRepository } from "@/lib/auth/domain/repository";
import { createAuthStore } from "@/lib/auth/presentation/auth-store";

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

const MOCK_USER: User = {
  id: "user-1",
  email: "test@gmail.com",
  name: "Test User",
  role: "operador",
  createdAt: "2025-01-01T00:00:00Z",
};

const MOCK_ADMIN_USER: User = {
  ...MOCK_USER,
  id: "admin-1",
  role: "admin",
  name: "Admin User",
};

const MOCK_SESSION: Session = {
  user: MOCK_USER,
  expiresAt: "2025-01-08T00:00:00Z",
  lastActivity: Date.now(),
};

function createMockRepo(
  overrides: Partial<IAuthRepository> = {},
): IAuthRepository {
  return {
    login: vi.fn().mockResolvedValue(MOCK_SESSION),
    register: vi.fn().mockResolvedValue(MOCK_USER),
    logout: vi.fn().mockResolvedValue(undefined),
    getSession: vi.fn().mockResolvedValue(MOCK_SESSION),
    refreshSession: vi.fn().mockResolvedValue(MOCK_SESSION),
    ...overrides,
  };
}

function createStoreWith(overrides: Partial<IAuthRepository> = {}) {
  return createAuthStore({ repository: createMockRepo(overrides) });
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("AuthStore initial state", () => {
  it("starts with null user, session, and role", () => {
    const store = createStoreWith();
    const state = store.getState();

    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.role).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

describe("AuthStore login", () => {
  it("sets user, session, and role on successful login", async () => {
    const store = createStoreWith();
    const credentials: LoginCredentials = {
      email: "test@gmail.com",
      password: "password123",
    };

    await store.getState().login(credentials);
    const state = store.getState();

    expect(state.user).toEqual(MOCK_USER);
    expect(state.session).toEqual(MOCK_SESSION);
    expect(state.role).toBe("operador");
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("sets isLoading to true during login", async () => {
    let resolveLogin!: (session: Session) => void;
    const loginPromise = new Promise<Session>((resolve) => {
      resolveLogin = resolve;
    });
    const store = createStoreWith({
      login: vi.fn().mockReturnValue(loginPromise),
    });

    const loginCall = store.getState().login({
      email: "test@gmail.com",
      password: "password123",
    });

    // Should be loading
    expect(store.getState().isLoading).toBe(true);

    // Resolve the login
    resolveLogin(MOCK_SESSION);
    await loginCall;

    expect(store.getState().isLoading).toBe(false);
  });

  it("sets error on InvalidCredentialsError", async () => {
    const store = createStoreWith({
      login: vi.fn().mockRejectedValue(new InvalidCredentialsError()),
    });

    await expect(
      store.getState().login({ email: "bad@example.com", password: "wrong" }),
    ).rejects.toThrow();

    const state = store.getState();
    expect(state.error).toBe("Invalid email or password");
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("sets generic error on unknown failure", async () => {
    const store = createStoreWith({
      login: vi.fn().mockRejectedValue(new Error("Server error")),
    });

    await expect(
      store.getState().login({ email: "test@gmail.com", password: "pass" }),
    ).rejects.toThrow();

    expect(store.getState().error).toBe("Service unavailable, try again later");
  });
});

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

describe("AuthStore register", () => {
  const data: RegistrationData = {
    email: "newuser@gmail.com",
    password: "password123",
    name: "New User",
  };

  it("returns the registered user on success", async () => {
    const store = createStoreWith();
    const user = await store.getState().register(data);

    expect(user).toEqual(MOCK_USER);
    expect(store.getState().isLoading).toBe(false);
  });

  it("sets error on InvalidEmailDomainError", async () => {
    const store = createStoreWith({
      register: vi.fn().mockRejectedValue(new InvalidEmailDomainError()),
    });

    await expect(
      store.getState().register({
        email: "bad@company.com",
        password: "pass",
        name: "Bad",
      }),
    ).rejects.toThrow();

    expect(store.getState().error).toBe("Email domain not allowed");
  });

  it("sets error on DuplicateEmailError", async () => {
    const store = createStoreWith({
      register: vi.fn().mockRejectedValue(new DuplicateEmailError()),
    });

    await expect(store.getState().register(data)).rejects.toThrow();

    expect(store.getState().error).toBe(
      "An account with this email already exists",
    );
  });

  it("does NOT auto-login after registration", async () => {
    const store = createStoreWith();

    await store.getState().register(data);

    // Should still be unauthenticated
    expect(store.getState().isAuthenticated).toBe(false);
    expect(store.getState().user).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

describe("AuthStore logout", () => {
  it("clears all state on logout", async () => {
    const store = createStoreWith();

    // Login first
    await store.getState().login({
      email: "test@gmail.com",
      password: "pass",
    });
    expect(store.getState().isAuthenticated).toBe(true);

    // Logout
    await store.getState().logout();

    const state = store.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.role).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it("clears state even if server logout fails", async () => {
    const store = createStoreWith({
      logout: vi.fn().mockRejectedValue(new Error("Server error")),
    });

    // Login first
    await store.getState().login({
      email: "test@gmail.com",
      password: "pass",
    });
    expect(store.getState().isAuthenticated).toBe(true);

    // Logout should still clear client state
    await store.getState().logout();
    expect(store.getState().isAuthenticated).toBe(false);
    expect(store.getState().user).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Refresh session
// ---------------------------------------------------------------------------

describe("AuthStore refreshSession", () => {
  it("updates session state on successful refresh", async () => {
    const refreshedSession: Session = {
      user: MOCK_ADMIN_USER,
      expiresAt: "2025-01-15T00:00:00Z",
      lastActivity: Date.now(),
    };
    const store = createStoreWith({
      refreshSession: vi.fn().mockResolvedValue(refreshedSession),
    });

    await store.getState().refreshSession();

    expect(store.getState().user).toEqual(MOCK_ADMIN_USER);
    expect(store.getState().role).toBe("admin");
    expect(store.getState().isAuthenticated).toBe(true);
  });

  it("resets state on SessionExpiredError", async () => {
    const store = createStoreWith({
      refreshSession: vi.fn().mockRejectedValue(new SessionExpiredError()),
    });

    // Login first
    await store.getState().login({
      email: "test@gmail.com",
      password: "pass",
    });
    expect(store.getState().isAuthenticated).toBe(true);

    // Refresh fails with expired session
    await expect(store.getState().refreshSession()).rejects.toThrow();

    expect(store.getState().isAuthenticated).toBe(false);
    expect(store.getState().user).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// checkPermission
// ---------------------------------------------------------------------------

describe("AuthStore checkPermission", () => {
  it("returns true when user role is sufficient", async () => {
    const store = createStoreWith();
    await store.getState().login({
      email: "test@gmail.com",
      password: "pass",
    });

    expect(store.getState().checkPermission("solo_lectura")).toBe(true);
    expect(store.getState().checkPermission("operador")).toBe(true);
  });

  it("returns false when user role is insufficient", async () => {
    const store = createStoreWith();
    await store.getState().login({
      email: "test@gmail.com",
      password: "pass",
    });

    expect(store.getState().checkPermission("admin")).toBe(false);
  });

  it("returns false when not authenticated", () => {
    const store = createStoreWith();
    expect(store.getState().checkPermission("solo_lectura")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// setSession
// ---------------------------------------------------------------------------

describe("AuthStore setSession", () => {
  it("sets authenticated state from a session", () => {
    const store = createStoreWith();
    store.getState().setSession(MOCK_SESSION);

    expect(store.getState().user).toEqual(MOCK_USER);
    expect(store.getState().session).toEqual(MOCK_SESSION);
    expect(store.getState().role).toBe("operador");
    expect(store.getState().isAuthenticated).toBe(true);
  });

  it("resets to initial state when session is null", () => {
    const store = createStoreWith();

    // First set a session
    store.getState().setSession(MOCK_SESSION);
    expect(store.getState().isAuthenticated).toBe(true);

    // Then clear it
    store.getState().setSession(null);
    expect(store.getState().isAuthenticated).toBe(false);
    expect(store.getState().user).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// clearError
// ---------------------------------------------------------------------------

describe("AuthStore clearError", () => {
  it("clears the error field", async () => {
    const store = createStoreWith({
      login: vi.fn().mockRejectedValue(new InvalidCredentialsError()),
    });

    await expect(
      store.getState().login({ email: "test@gmail.com", password: "wrong" }),
    ).rejects.toThrow();

    expect(store.getState().error).toBeTruthy();

    store.getState().clearError();
    expect(store.getState().error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// reset
// ---------------------------------------------------------------------------

describe("AuthStore reset", () => {
  it("resets all state to initial values", async () => {
    const store = createStoreWith();

    // Login first
    await store.getState().login({
      email: "test@gmail.com",
      password: "pass",
    });
    expect(store.getState().isAuthenticated).toBe(true);

    // Reset
    store.getState().reset();

    expect(store.getState().user).toBeNull();
    expect(store.getState().session).toBeNull();
    expect(store.getState().role).toBeNull();
    expect(store.getState().isAuthenticated).toBe(false);
    expect(store.getState().isLoading).toBe(false);
    expect(store.getState().error).toBeNull();
  });
});
