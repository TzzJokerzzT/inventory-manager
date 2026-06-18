/**
 * @vitest-environment happy-dom
 *
 * Tests for the SessionExpiryModal component.
 *
 * Tests modal trigger behavior, non-dismissability,
 * and redirect on "Volver al login" action.
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
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock auth context
const mockLogout = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/auth/presentation/auth-provider", () => ({
  useAuth: () => ({
    logout: mockLogout,
    user: { id: "1", email: "test@test.com", name: "Test", role: "admin" },
    role: "admin",
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    refreshSession: vi.fn(),
    checkPermission: vi.fn(),
    clearError: vi.fn(),
    error: null,
    session: null,
  }),
}));

// Mock motion/react
vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock HeroUI components
vi.mock("@heroui/react", () => ({
  Button: ({ children, onPress, className, ...props }: any) => (
    <button className={className} onClick={onPress} {...props}>
      {typeof children === "function" ? children() : children}
    </button>
  ),
  Modal: {
    Backdrop: ({
      children,
      isDismissable,
      isKeyboardDismissDisabled,
      isOpen,
      ...props
    }: any) =>
      isOpen ? (
        <div
          data-testid="modal-backdrop"
          data-dismissable={isDismissable ? "true" : "false"}
          data-keyboard-dismiss-disabled={
            isKeyboardDismissDisabled ? "true" : "false"
          }
          {...props}
        >
          {children}
        </div>
      ) : null,
    Container: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    Dialog: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Header: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Icon: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    Heading: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    Footer: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

import { SessionExpiryModal } from "@/app/(protected)/_components/session-expiry-modal";

describe("SessionExpiryModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when isOpen is true", () => {
    render(<SessionExpiryModal isOpen={true} />);

    expect(screen.getByText("Sesión Expirada")).toBeTruthy();
    expect(
      screen.getByText(/Tu sesión ha expirado por inactividad/),
    ).toBeTruthy();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<SessionExpiryModal isOpen={false} />);

    expect(
      container.querySelector("[data-testid='modal-backdrop']"),
    ).toBeNull();
  });

  it("shows Volver al login button", () => {
    render(<SessionExpiryModal isOpen={true} />);

    expect(screen.getByText("Volver al login")).toBeTruthy();
  });

  it("calls logout and redirects to /login on button click", async () => {
    const user = userEvent.setup();
    render(<SessionExpiryModal isOpen={true} />);

    const loginButton = screen.getByText("Volver al login");
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledOnce();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("modal backdrop is not dismissable (isDismissable=false)", () => {
    render(<SessionExpiryModal isOpen={true} />);

    const backdrop = screen.getByTestId("modal-backdrop");
    expect(backdrop.getAttribute("data-dismissable")).toBe("false");
    // isKeyboardDismissDisabled is set to true, so Escape key won't close the modal
    expect(backdrop.getAttribute("data-keyboard-dismiss-disabled")).toBe(
      "true",
    );
  });
});
