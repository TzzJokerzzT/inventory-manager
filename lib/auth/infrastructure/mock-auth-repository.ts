/**
 * Mock IAuthRepository implementation for local development.
 *
 * Provides 3 hardcoded users without requiring a backend:
 * - admin@example.com / admin123 → admin
 * - operador@example.com / operador123 → operador
 * - lector@example.com / lector123 → solo_lectura
 *
 * Activated by setting NEXT_PUBLIC_MOCK_AUTH=true in .env.local
 */

import type {
  LoginCredentials,
  RegistrationData,
  Session,
  User,
} from "../domain/entities";
import type { IAuthRepository } from "../domain/repository";

// ---------------------------------------------------------------------------
// Hardcoded mock users
// ---------------------------------------------------------------------------

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "mock-admin-001",
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "mock-operador-001",
    email: "operador@example.com",
    password: "operador123",
    name: "Operador User",
    role: "operador",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "mock-lector-001",
    email: "lector@example.com",
    password: "lector123",
    name: "Lector User",
    role: "solo_lectura",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function createSession(user: User): Session {
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return {
    user,
    expiresAt: new Date(now + sevenDays).toISOString(),
    lastActivity: now,
  };
}

function stripPassword(user: (typeof MOCK_USERS)[number]): User {
  const { password: _, ...rest } = user;
  return rest;
}

// ---------------------------------------------------------------------------
// Mock repository implementation
// ---------------------------------------------------------------------------

export const mockAuthRepository: IAuthRepository = {
  async login(credentials: LoginCredentials): Promise<Session> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const user = MOCK_USERS.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password,
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    return createSession(stripPassword(user));
  },

  async register(data: RegistrationData): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const exists = MOCK_USERS.some((u) => u.email === data.email);
    if (exists) {
      throw new Error("Email already registered");
    }

    const newUser: User = {
      id: `mock-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: "solo_lectura",
      createdAt: new Date().toISOString(),
    };

    return newUser;
  },

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
  },

  async getSession(): Promise<Session | null> {
    // Mock always returns null — session is managed client-side after login
    return null;
  },

  async refreshSession(): Promise<Session> {
    // Mock refresh — always succeeds if there's a current session in store
    throw new Error(
      "Session refresh not available in mock mode — please log in again",
    );
  },
};
