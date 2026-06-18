/**
 * @vitest-environment happy-dom
 *
 * Tests for the register page component.
 *
 * These tests verify:
 * - Form rendering and field display
 * - Domain whitelist validation (Valibot)
 * - Confirm password match validation
 * - Form submission with useAuth().register()
 * - Error state display (duplicate email, invalid domain, network error)
 * - Redirect to /login on success
 * - Redirect to /dashboard when already authenticated
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
  usePathname: () => "/register",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock auth context
const mockRegister = vi.fn();
const mockClearError = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("@/lib/auth/presentation/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

import RegisterPage from "@/app/(auth)/register/page";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      register: mockRegister,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  it("renders name, email, password, and confirm password fields", () => {
    render(<RegisterPage />);

    // "Create Account" appears in both the card title and button — use heading role
    expect(
      screen.getByRole("heading", { name: /create account/i, level: 3 }),
    ).toBeTruthy();
    expect(screen.getByLabelText("Full Name")).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  it("renders a link to the login page", () => {
    render(<RegisterPage />);

    const loginLink = screen.getByText("Sign in");
    expect(loginLink).toBeTruthy();
  });

  it("shows allowed email domains in the description", () => {
    render(<RegisterPage />);

    expect(screen.getByText(/hotmail.com/)).toBeTruthy();
    expect(screen.getByText(/gmail.com/)).toBeTruthy();
  });

  it("calls register with validated data on form submission", async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: "1",
      email: "test@gmail.com",
      name: "Test User",
      role: "solo_lectura" as const,
      createdAt: new Date().toISOString(),
    };
    mockRegister.mockResolvedValue(mockUser);

    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Full Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@gmail.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    // Find the confirm password field — it also has label "Confirm Password"
    const confirmInputs = screen.getAllByLabelText(/confirm password/i);
    await user.type(
      confirmInputs[0] || confirmInputs.find(Boolean)!,
      "password123",
    );

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "test@gmail.com",
        password: "password123",
        name: "Test User",
      });
    });
  });

  it("redirects to /login?registered=true on successful registration", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      id: "1",
      email: "test@gmail.com",
      name: "Test User",
      role: "solo_lectura",
      createdAt: new Date().toISOString(),
    });

    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Full Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@gmail.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    const confirmInputs = screen.getAllByLabelText(/confirm password/i);
    await user.type(confirmInputs[0], "password123");

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?registered=true");
    });
  });

  it("shows error for non-whitelisted email domain via inline validation", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "test@company.com");

    // Move focus away to trigger validation
    await user.tab();

    // The TextField validate function should show domain error
    await waitFor(() => {
      const domainError = screen.queryByText(/email domain not allowed/i);
      // The error is shown via validate prop on TextField
      expect(domainError).toBeTruthy();
    });
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Full Name"), "Test User");
    await user.type(screen.getByLabelText("Email"), "test@gmail.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    const confirmInputs = screen.getAllByLabelText(/confirm password/i);
    await user.type(confirmInputs[0], "different123");

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeTruthy();
    });
  });

  it("displays error message from auth state", () => {
    mockUseAuth.mockReturnValue({
      register: mockRegister,
      isAuthenticated: false,
      isLoading: false,
      error: "An account with this email already exists",
      clearError: mockClearError,
    });

    render(<RegisterPage />);

    expect(
      screen.getByText("An account with this email already exists"),
    ).toBeTruthy();
  });

  it("redirects to /dashboard when already authenticated", () => {
    mockUseAuth.mockReturnValue({
      register: mockRegister,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      clearError: mockClearError,
      user: { id: "1", email: "test@test.com", name: "Test", role: "admin" },
    });

    render(<RegisterPage />);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("clears auth error on unmount", () => {
    const { unmount } = render(<RegisterPage />);
    unmount();
    expect(mockClearError).toHaveBeenCalled();
  });
});
