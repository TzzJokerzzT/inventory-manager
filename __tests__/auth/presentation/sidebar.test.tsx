/**
 * @vitest-environment happy-dom
 *
 * Tests for the Sidebar component.
 *
 * Tests role-conditional nav items, active state highlighting,
 * and logout functionality.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock next/navigation
const mockPathname = vi.fn(() => "/dashboard");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => mockPathname(),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock auth context
const mockUseAuth = vi.fn();

vi.mock("@/lib/auth/presentation/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock motion/react
vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    aside: ({ children, ...props }: any) => (
      <aside {...props}>{children}</aside>
    ),
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

// Mock HeroUI components
vi.mock("@heroui/react", () => ({
  Button: ({ children, onPress, className, ...props }: any) => (
    <button className={className} onClick={onPress} {...props}>
      {typeof children === "function" ? children() : children}
    </button>
  ),
  Chip: ({ children, variant, size, ...props }: any) => (
    <span data-variant={variant} data-size={size} {...props}>
      {children}
    </span>
  ),
  Drawer: {
    Backdrop: ({ children, isOpen, onOpenChange, ...props }: any) =>
      isOpen ? (
        <div data-testid="drawer-backdrop" {...props}>
          {children}
        </div>
      ) : null,
    Content: ({ children, placement, ...props }: any) => (
      <div data-placement={placement} {...props}>
        {children}
      </div>
    ),
    Dialog: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Header: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Heading: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    Body: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Footer: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

import { Sidebar } from "@/app/(protected)/_components/sidebar";

// Helper to set up auth mock with a specific role
function mockAuthWithRole(role: "admin" | "operador" | "solo_lectura" | null) {
  mockUseAuth.mockReturnValue({
    user: role
      ? { id: "1", email: "test@test.com", name: "Test User", role }
      : null,
    role,
    isAuthenticated: !!role,
    isLoading: false,
    logout: vi.fn().mockResolvedValue(undefined),
    login: vi.fn(),
    register: vi.fn(),
    refreshSession: vi.fn(),
    checkPermission: vi.fn(),
    clearError: vi.fn(),
    error: null,
    session: null,
  });
}

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("role-conditional navigation", () => {
    it("shows all nav items for admin role", () => {
      mockAuthWithRole("admin");
      mockPathname.mockReturnValue("/dashboard");

      render(<Sidebar />);

      expect(screen.getByText("Dashboard")).toBeTruthy();
      expect(screen.getByText("Productos")).toBeTruthy();
      expect(screen.getByText("Movimientos")).toBeTruthy();
      expect(screen.getByText("Compras")).toBeTruthy();
      expect(screen.getByText("Reportes")).toBeTruthy();
      expect(screen.getByText("Usuarios")).toBeTruthy();
      expect(screen.getByText("Configuración")).toBeTruthy();
    });

    it("shows operational items for operador role", () => {
      mockAuthWithRole("operador");
      mockPathname.mockReturnValue("/dashboard");

      render(<Sidebar />);

      expect(screen.getByText("Dashboard")).toBeTruthy();
      expect(screen.getByText("Productos")).toBeTruthy();
      expect(screen.getByText("Movimientos")).toBeTruthy();
      expect(screen.getByText("Compras")).toBeTruthy();
      expect(screen.getByText("Reportes")).toBeTruthy();

      // Should NOT show admin-only items
      expect(screen.queryByText("Usuarios")).toBeNull();
      expect(screen.queryByText("Configuración")).toBeNull();
    });

    it("shows only dashboard and reports for solo_lectura role", () => {
      mockAuthWithRole("solo_lectura");
      mockPathname.mockReturnValue("/dashboard");

      render(<Sidebar />);

      expect(screen.getByText("Dashboard")).toBeTruthy();
      expect(screen.getByText("Reportes")).toBeTruthy();

      // Should NOT show operational/admin items
      expect(screen.queryByText("Productos")).toBeNull();
      expect(screen.queryByText("Movimientos")).toBeNull();
      expect(screen.queryByText("Compras")).toBeNull();
      expect(screen.queryByText("Usuarios")).toBeNull();
      expect(screen.queryByText("Configuración")).toBeNull();
    });

    it("returns null when user has no role", () => {
      mockAuthWithRole(null);
      const { container } = render(<Sidebar />);
      expect(container.innerHTML).toBe("");
    });
  });

  describe("active state highlighting", () => {
    it("highlights current path as active", () => {
      mockAuthWithRole("admin");
      mockPathname.mockReturnValue("/dashboard");

      render(<Sidebar />);

      const dashboardLink = screen.getByText("Dashboard").closest("a");
      expect(dashboardLink?.getAttribute("aria-current")).toBe("page");
    });

    it("highlights sub-path as active", () => {
      mockAuthWithRole("admin");
      mockPathname.mockReturnValue("/dashboard/products/123");

      render(<Sidebar />);

      const productsLink = screen.getByText("Productos").closest("a");
      expect(productsLink?.getAttribute("aria-current")).toBe("page");
    });
  });

  describe("logout button", () => {
    it("renders the logout button", () => {
      mockAuthWithRole("admin");
      mockPathname.mockReturnValue("/dashboard");

      render(<Sidebar />);

      expect(screen.getByText("Cerrar Sesión")).toBeTruthy();
    });

    it("calls logout when the logout button is clicked", async () => {
      const mockLogout = vi.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        user: { id: "1", email: "test@test.com", name: "Test", role: "admin" },
        role: "admin",
        isAuthenticated: true,
        isLoading: false,
        logout: mockLogout,
        login: vi.fn(),
        register: vi.fn(),
        refreshSession: vi.fn(),
        checkPermission: vi.fn(),
        clearError: vi.fn(),
        error: null,
        session: null,
      });
      mockPathname.mockReturnValue("/dashboard");

      render(<Sidebar />);

      const logoutButton = screen.getByText("Cerrar Sesión");
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledOnce();
      });
    });
  });
});
