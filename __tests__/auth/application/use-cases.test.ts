/**
 * @vitest-environment node
 *
 * Tests for auth application use cases.
 *
 * Each use case receives a mocked IAuthRepository via constructor injection,
 * verifying that business rules are enforced before repository calls and
 * that errors are properly classified.
 */

import { describe, expect, it, vi } from "vitest";
import type {
  LoginCredentials,
  RegistrationData,
  Session,
  User,
} from "@/lib/auth/domain/entities";
import type { IAuthRepository } from "@/lib/auth/domain/repository";
import {
  AuthError,
  CheckPermissionUseCase,
  DuplicateEmailError,
  InvalidCredentialsError,
  InvalidEmailDomainError,
  LoginUseCase,
  LogoutUseCase,
  NetworkError,
  RefreshSessionUseCase,
  RegisterUseCase,
  SessionExpiredError,
  classifyError,
} from "@/lib/auth/application/use-cases";

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

// ---------------------------------------------------------------------------
// LoginUseCase
// ---------------------------------------------------------------------------

describe("LoginUseCase", () => {
  it("calls repository.login with credentials and returns session", async () => {
    const repo = createMockRepo();
    const useCase = new LoginUseCase(repo);

    const credentials: LoginCredentials = {
      email: "test@gmail.com",
      password: "password123",
    };
    const session = await useCase.execute(credentials);

    expect(session).toEqual(MOCK_SESSION);
    expect(repo.login).toHaveBeenCalledWith(credentials);
  });

  it("throws InvalidCredentialsError on 401 response", async () => {
    const axiosError = {
      response: { status: 401 },
      isAxiosError: true,
    };
    const repo = createMockRepo({
      login: vi.fn().mockRejectedValue(axiosError),
    });
    const useCase = new LoginUseCase(repo);

    await expect(
      useCase.execute({ email: "bad@example.com", password: "wrong" }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("throws NetworkError on network failure", async () => {
    const networkError = { code: "ERR_NETWORK" };
    const repo = createMockRepo({
      login: vi.fn().mockRejectedValue(networkError),
    });
    const useCase = new LoginUseCase(repo);

    await expect(
      useCase.execute({ email: "test@gmail.com", password: "pass" }),
    ).rejects.toThrow(NetworkError);
  });

  it("re-throws AuthError unchanged when repo already throws one", async () => {
    const authError = new InvalidCredentialsError();
    const repo = createMockRepo({
      login: vi.fn().mockRejectedValue(authError),
    });
    const useCase = new LoginUseCase(repo);

    await expect(
      useCase.execute({ email: "test@gmail.com", password: "pass" }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("wraps unknown errors in AuthError", async () => {
    const repo = createMockRepo({
      login: vi.fn().mockRejectedValue("something weird"),
    });
    const useCase = new LoginUseCase(repo);

    await expect(
      useCase.execute({ email: "test@gmail.com", password: "pass" }),
    ).rejects.toThrow(AuthError);
  });
});

// ---------------------------------------------------------------------------
// RegisterUseCase
// ---------------------------------------------------------------------------

describe("RegisterUseCase", () => {
  it("calls repository.register with valid data and returns user", async () => {
    const repo = createMockRepo();
    const useCase = new RegisterUseCase(repo);

    const data: RegistrationData = {
      email: "newuser@gmail.com",
      password: "password123",
      name: "New User",
    };
    const user = await useCase.execute(data);

    expect(user).toEqual(MOCK_USER);
    expect(repo.register).toHaveBeenCalledWith(data);
  });

  it("throws InvalidEmailDomainError for non-whitelisted email domain", async () => {
    const repo = createMockRepo();
    const useCase = new RegisterUseCase(repo);

    await expect(
      useCase.execute({
        email: "user@company.com",
        password: "password123",
        name: "Corporate User",
      }),
    ).rejects.toThrow(InvalidEmailDomainError);

    // Should NOT call the repository if validation fails
    expect(repo.register).not.toHaveBeenCalled();
  });

  it("throws InvalidEmailDomainError for case-insensitive non-whitelisted domain", async () => {
    const repo = createMockRepo();
    const useCase = new RegisterUseCase(repo);

    await expect(
      useCase.execute({
        email: "user@EvIl.CoM",
        password: "password123",
        name: "Evil User",
      }),
    ).rejects.toThrow(InvalidEmailDomainError);
  });

  it("accepts all whitelisted email domains", async () => {
    const repo = createMockRepo();
    const useCase = new RegisterUseCase(repo);

    const domains = ["hotmail.com", "gmail.com", "yahoo.com", "outlook.com"];

    for (const domain of domains) {
      const data: RegistrationData = {
        email: `user@${domain}`,
        password: "password123",
        name: "Test User",
      };
      await useCase.execute(data);
    }

    expect(repo.register).toHaveBeenCalledTimes(domains.length);
  });

  it("throws DuplicateEmailError on 409 conflict", async () => {
    const conflictError = { response: { status: 409 } };
    const repo = createMockRepo({
      register: vi.fn().mockRejectedValue(conflictError),
    });
    const useCase = new RegisterUseCase(repo);

    await expect(
      useCase.execute({
        email: "existing@gmail.com",
        password: "password123",
        name: "Existing User",
      }),
    ).rejects.toThrow(DuplicateEmailError);
  });

  it("throws NetworkError on network failure", async () => {
    const networkError = { code: "ECONNREFUSED" };
    const repo = createMockRepo({
      register: vi.fn().mockRejectedValue(networkError),
    });
    const useCase = new RegisterUseCase(repo);

    await expect(
      useCase.execute({
        email: "user@gmail.com",
        password: "password123",
        name: "Test User",
      }),
    ).rejects.toThrow(NetworkError);
  });
});

// ---------------------------------------------------------------------------
// LogoutUseCase
// ---------------------------------------------------------------------------

describe("LogoutUseCase", () => {
  it("calls repository.logout", async () => {
    const repo = createMockRepo();
    const useCase = new LogoutUseCase(repo);

    await useCase.execute();

    expect(repo.logout).toHaveBeenCalledOnce();
  });

  it("does not throw even if repository.logout fails", async () => {
    const repo = createMockRepo({
      logout: vi.fn().mockRejectedValue(new Error("Server error")),
    });
    const useCase = new LogoutUseCase(repo);

    // LogoutUseCase swallows errors — client state is always cleared
    await expect(useCase.execute()).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// RefreshSessionUseCase
// ---------------------------------------------------------------------------

describe("RefreshSessionUseCase", () => {
  it("calls repository.refreshSession and returns updated session", async () => {
    const refreshedSession: Session = {
      user: MOCK_USER,
      expiresAt: "2025-01-15T00:00:00Z",
      lastActivity: Date.now(),
    };
    const repo = createMockRepo({
      refreshSession: vi.fn().mockResolvedValue(refreshedSession),
    });
    const useCase = new RefreshSessionUseCase(repo);

    const session = await useCase.execute();
    expect(session).toEqual(refreshedSession);
    expect(repo.refreshSession).toHaveBeenCalledOnce();
  });

  it("throws SessionExpiredError on 403 (expired refresh token)", async () => {
    const forbiddenError = { response: { status: 403 } };
    const repo = createMockRepo({
      refreshSession: vi.fn().mockRejectedValue(forbiddenError),
    });
    const useCase = new RefreshSessionUseCase(repo);

    await expect(useCase.execute()).rejects.toThrow(SessionExpiredError);
  });

  it("throws NetworkError on network failure", async () => {
    const networkError = { code: "ETIMEDOUT" };
    const repo = createMockRepo({
      refreshSession: vi.fn().mockRejectedValue(networkError),
    });
    const useCase = new RefreshSessionUseCase(repo);

    await expect(useCase.execute()).rejects.toThrow(NetworkError);
  });
});

// ---------------------------------------------------------------------------
// CheckPermissionUseCase
// ---------------------------------------------------------------------------

describe("CheckPermissionUseCase", () => {
  const useCase = new CheckPermissionUseCase(createMockRepo());

  it("returns true when user role meets the required role", () => {
    expect(useCase.execute("admin", "operador")).toBe(true);
  });

  it("returns true when user role equals the required role", () => {
    expect(useCase.execute("operador", "operador")).toBe(true);
  });

  it("returns false when user role is below the required role", () => {
    expect(useCase.execute("solo_lectura", "admin")).toBe(false);
  });

  it("admin can access everything", () => {
    expect(useCase.execute("admin", "admin")).toBe(true);
    expect(useCase.execute("admin", "operador")).toBe(true);
    expect(useCase.execute("admin", "solo_lectura")).toBe(true);
  });

  it("solo_lectura can only access solo_lectura routes", () => {
    expect(useCase.execute("solo_lectura", "solo_lectura")).toBe(true);
    expect(useCase.execute("solo_lectura", "operador")).toBe(false);
    expect(useCase.execute("solo_lectura", "admin")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// classifyError helper
// ---------------------------------------------------------------------------

describe("classifyError", () => {
  it("returns AuthError unchanged", () => {
    const original = new InvalidCredentialsError();
    expect(classifyError(original)).toBe(original);
  });

  it("classifies 401 as InvalidCredentialsError", () => {
    const error = { response: { status: 401 } };
    expect(classifyError(error)).toBeInstanceOf(InvalidCredentialsError);
  });

  it("classifies 409 as DuplicateEmailError", () => {
    const error = { response: { status: 409 } };
    expect(classifyError(error)).toBeInstanceOf(DuplicateEmailError);
  });

  it("classifies 403 as SessionExpiredError", () => {
    const error = { response: { status: 403 } };
    expect(classifyError(error)).toBeInstanceOf(SessionExpiredError);
  });

  it("classifies ERR_NETWORK as NetworkError", () => {
    const error = { code: "ERR_NETWORK" };
    expect(classifyError(error)).toBeInstanceOf(NetworkError);
  });

  it("classifies ECONNREFUSED as NetworkError", () => {
    const error = { code: "ECONNREFUSED" };
    expect(classifyError(error)).toBeInstanceOf(NetworkError);
  });

  it("classifies ETIMEDOUT as NetworkError", () => {
    const error = { code: "ETIMEDOUT" };
    expect(classifyError(error)).toBeInstanceOf(NetworkError);
  });

  it("wraps unknown errors as generic AuthError", () => {
    expect(classifyError("string error")).toBeInstanceOf(AuthError);
    expect(classifyError({ random: "object" })).toBeInstanceOf(AuthError);
    expect(classifyError(new Error("some error"))).toBeInstanceOf(AuthError);
  });
});
