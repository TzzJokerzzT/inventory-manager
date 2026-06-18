import { describe, expect, it } from "vitest";
import type {
  AuthState,
  LoginCredentials,
  RegistrationData,
  Role,
  Session,
  SessionStatus,
  User,
} from "@/lib/auth/domain/entities";

describe("entities type structure", () => {
  it("constructs a valid User", () => {
    const user: User = {
      id: "1",
      email: "admin@gmail.com",
      name: "Admin User",
      role: "admin",
      createdAt: "2025-01-01T00:00:00Z",
    };
    expect(user.id).toBe("1");
    expect(user.role).toBe("admin");
  });

  it("constructs a valid Session", () => {
    const session: Session = {
      user: {
        id: "1",
        email: "op@gmail.com",
        name: "Operator",
        role: "operador",
        createdAt: "2025-01-01T00:00:00Z",
      },
      expiresAt: "2025-01-08T00:00:00Z",
      lastActivity: Date.now(),
    };
    expect(session.user.role).toBe("operador");
    expect(session.expiresAt).toBeDefined();
  });

  it("constructs a valid AuthState", () => {
    const state: AuthState = {
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: true,
    };
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it("constructs valid LoginCredentials", () => {
    const creds: LoginCredentials = {
      email: "user@gmail.com",
      password: "secret",
    };
    expect(creds.email).toBeDefined();
  });

  it("constructs valid RegistrationData", () => {
    const data: RegistrationData = {
      email: "newuser@gmail.com",
      password: "password123",
      name: "New User",
    };
    expect(data.name).toBe("New User");
  });

  it("SessionStatus accepts all valid values", () => {
    const statuses: SessionStatus[] = ["active", "expired", "idle"];
    expect(statuses).toHaveLength(3);
  });

  it("Role type accepts all defined role values", () => {
    const roles: Role[] = ["admin", "operador", "solo_lectura"];
    expect(roles).toHaveLength(3);
  });
});
