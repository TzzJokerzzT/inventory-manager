import { describe, expect, it } from "vitest";
import type { IAuthRepository } from "@/lib/auth/domain/repository";
import type {
  LoginCredentials,
  RegistrationData,
  Session,
  User,
} from "@/lib/auth/domain/entities";

describe("IAuthRepository interface contract", () => {
  it("can be implemented as a mock for testing", () => {
    const mockRepo: IAuthRepository = {
      login: async (credentials: LoginCredentials) => ({
        user: {
          id: "1",
          email: credentials.email,
          name: "Test User",
          role: "operador",
          createdAt: new Date().toISOString(),
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: Date.now(),
      }),
      register: async (data: RegistrationData) => ({
        id: "2",
        email: data.email,
        name: data.name,
        role: "solo_lectura",
        createdAt: new Date().toISOString(),
      }),
      logout: async () => {},
      getSession: async () => null,
      refreshSession: async () => ({
        user: {
          id: "1",
          email: "test@gmail.com",
          name: "Test User",
          role: "operador",
          createdAt: new Date().toISOString(),
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: Date.now(),
      }),
    };

    // Verify the interface methods exist and are callable
    expect(typeof mockRepo.login).toBe("function");
    expect(typeof mockRepo.register).toBe("function");
    expect(typeof mockRepo.logout).toBe("function");
    expect(typeof mockRepo.getSession).toBe("function");
    expect(typeof mockRepo.refreshSession).toBe("function");
  });

  it("login returns a Session", async () => {
    const mockRepo: IAuthRepository = {
      login: async () => ({
        user: {
          id: "1",
          email: "test@gmail.com",
          name: "Test",
          role: "admin",
          createdAt: "2025-01-01T00:00:00Z",
        },
        expiresAt: "2025-01-08T00:00:00Z",
        lastActivity: Date.now(),
      }),
      register: async () => ({
        id: "2",
        email: "test@gmail.com",
        name: "Test",
        role: "solo_lectura",
        createdAt: "2025-01-01T00:00:00Z",
      }),
      logout: async () => {},
      getSession: async () => null,
      refreshSession: async () => ({
        user: {
          id: "1",
          email: "test@gmail.com",
          name: "Test",
          role: "admin",
          createdAt: "2025-01-01T00:00:00Z",
        },
        expiresAt: "2025-01-08T00:00:00Z",
        lastActivity: Date.now(),
      }),
    };

    const session = await mockRepo.login({
      email: "test@gmail.com",
      password: "pass",
    });
    expect(session.user).toBeDefined();
    expect(session.expiresAt).toBeDefined();
  });

  it("getSession returns null for no session", async () => {
    const mockRepo: IAuthRepository = {
      login: async () => ({
        user: {
          id: "1",
          email: "test@gmail.com",
          name: "Test",
          role: "admin",
          createdAt: "2025-01-01T00:00:00Z",
        },
        expiresAt: "2025-01-08T00:00:00Z",
        lastActivity: Date.now(),
      }),
      register: async () => ({
        id: "2",
        email: "test@gmail.com",
        name: "Test",
        role: "solo_lectura",
        createdAt: "2025-01-01T00:00:00Z",
      }),
      logout: async () => {},
      getSession: async () => null,
      refreshSession: async () => ({
        user: {
          id: "1",
          email: "test@gmail.com",
          name: "Test",
          role: "admin",
          createdAt: "2025-01-01T00:00:00Z",
        },
        expiresAt: "2025-01-08T00:00:00Z",
        lastActivity: Date.now(),
      }),
    };

    const session = await mockRepo.getSession();
    expect(session).toBeNull();
  });
});
