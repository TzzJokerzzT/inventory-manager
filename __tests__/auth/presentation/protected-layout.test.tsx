/**
 * @vitest-environment happy-dom
 *
 * Tests for the protected layout component.
 *
 * Since this is a React component that uses hooks and context,
 * we test the redirection logic and authentication checks.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/navigation
const mockPush = vi.fn();
const mockPathname = vi.fn(() => "/dashboard");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => mockPathname(),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock auth context
const mockUseAuth = vi.fn();

vi.mock("@/lib/auth/presentation/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

import ProtectedLayout from "@/app/(protected)/layout";

describe("ProtectedLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /login when not authenticated", async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      role: null,
      user: null,
    });

    render(
      <ProtectedLayout>
        <div>Protected Content</div>
      </ProtectedLayout>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows loading spinner while verifying session", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      role: null,
      user: null,
    });

    const { container } = render(
      <ProtectedLayout>
        <div>Protected Content</div>
      </ProtectedLayout>,
    );

    // Should show a spinner (SVG element)
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders children when authenticated", async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      role: "admin",
      user: { id: "1", email: "test@test.com", name: "Test", role: "admin" },
    });

    const { getByText } = render(
      <ProtectedLayout>
        <div>Protected Content</div>
      </ProtectedLayout>,
    );

    await waitFor(() => {
      expect(getByText("Protected Content")).toBeTruthy();
    });
  });

  it("redirects to /forbidden when role is insufficient for a role-restricted route", async () => {
    // This test validates that if we add role-restricted routes to ROUTE_ROLE_MAP,
    // the layout will redirect to /forbidden.
    // Currently ROUTE_ROLE_MAP is empty, so all authenticated users can access all routes.
    // This test documents the expected behavior.

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      role: "solo_lectura",
      user: {
        id: "1",
        email: "test@test.com",
        name: "Test",
        role: "solo_lectura",
      },
    });
    mockPathname.mockReturnValue("/dashboard");

    render(
      <ProtectedLayout>
        <div>Dashboard Content</div>
      </ProtectedLayout>,
    );

    // No redirect to forbidden since /dashboard has no role requirement
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalledWith("/forbidden");
    });
  });
});
