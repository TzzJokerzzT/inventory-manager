/**
 * @vitest-environment happy-dom
 *
 * Tests for the login page component.
 *
 * These tests verify:
 * - Form rendering and field display
 * - Client-side validation with Valibot
 * - Form submission with useAuth().login()
 * - Error state display (invalid credentials, network error)
 * - Redirect to /dashboard on success
 * - Redirect to /dashboard when already authenticated
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/navigation
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock auth context
const mockLogin = vi.fn();
const mockClearError = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("@/lib/auth/presentation/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock HeroUI components that may cause issues in test env
vi.mock("@heroui/react", async () => {
  const actual = await vi.importActual("@heroui/react");
  return {
    ...actual,
  };
});

import LoginPage from "@/app/(auth)/login/page";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  it("renders email and password fields", () => {
    render(<LoginPage />);

    // "Sign In" appears in both the card title and button — use heading role
    expect(
      screen.getByRole("heading", { name: /sign in/i, level: 3 }),
    ).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  it("renders a link to the register page", () => {
    render(<LoginPage />);

    const registerLink = screen.getByText("Create one");
    expect(registerLink).toBeTruthy();
    expect(registerLink.closest("a")?.getAttribute("href")).toBe("/register");
  });

  it("calls login with validated credentials on form submission", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@gmail.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@gmail.com",
        password: "password123",
      });
    });
  });

  it("redirects to /dashboard on successful login", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@gmail.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("is already authenticated, redirects to /dashboard", () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      clearError: mockClearError,
      user: { id: "1", email: "test@test.com", name: "Test", role: "admin" },
    });

    render(<LoginPage />);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("displays error message from auth state", () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
      error: "Invalid email or password",
      clearError: mockClearError,
    });

    render(<LoginPage />);

    expect(screen.getByText("Invalid email or password")).toBeTruthy();
  });

  it("disables submit button while loading", () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      clearError: mockClearError,
    });

    render(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: /signing in/i });
    expect(submitButton).toBeTruthy();
    expect(submitButton.getAttribute("aria-disabled")).toBe("true");
  });

  it("clears auth error on unmount", () => {
    const { unmount } = render(<LoginPage />);

    unmount();

    expect(mockClearError).toHaveBeenCalled();
  });
});
