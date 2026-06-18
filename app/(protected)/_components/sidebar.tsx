"use client";

/**
 * Sidebar — role-conditional navigation for protected routes.
 *
 * - Desktop: collapsible sidebar on the left with icon + label nav items
 * - Mobile: Drawer overlay triggered by hamburger menu button
 * - Uses AnimatePresence + motion.div for slide transitions
 * - Renders nav items conditionally based on user role:
 *   - admin: all items
 *   - operador: dashboard, products, movements, purchases, reports
 *   - solo_lectura: dashboard, reports only
 * - Active state highlighting using usePathname()
 * - Logout button at the bottom
 */

import { Button, Drawer } from "@heroui/react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { Role } from "@/lib/auth/domain/entities";
import { hasPermission } from "@/lib/auth/domain/value-objects";
import { useAuth } from "@/lib/auth/presentation/auth-provider";
import {
  ChevronLeftIcon,
  DashboardIcon,
  InventoryIcon,
  LogoutIcon,
  MovementsIcon,
  PurchasesIcon,
  ReportsIcon,
  SettingsIcon,
  UsersIcon,
} from "@/lib/icons";

// ---------------------------------------------------------------------------
// Navigation item definitions
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<
    React.SVGProps<SVGSVGElement> & { className?: string }
  >;
  minRole: Role;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
    minRole: "solo_lectura",
  },
  {
    label: "Productos",
    href: "/dashboard/products",
    icon: InventoryIcon,
    minRole: "operador",
  },
  {
    label: "Movimientos",
    href: "/dashboard/movements",
    icon: MovementsIcon,
    minRole: "operador",
  },
  {
    label: "Compras",
    href: "/dashboard/purchases",
    icon: PurchasesIcon,
    minRole: "operador",
  },
  {
    label: "Reportes",
    href: "/dashboard/reports",
    icon: ReportsIcon,
    minRole: "solo_lectura",
  },
  {
    label: "Usuarios",
    href: "/dashboard/users",
    icon: UsersIcon,
    minRole: "admin",
  },
  {
    label: "Configuración",
    href: "/dashboard/settings",
    icon: SettingsIcon,
    minRole: "admin",
  },
];

// ---------------------------------------------------------------------------
// Sidebar content (shared between desktop and mobile)
// ---------------------------------------------------------------------------

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

function SidebarContent({ collapsed, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const { role, logout } = useAuth();

  const visibleItems = useMemo(
    () => NAV_ITEMS.filter((item) => role && hasPermission(role, item.minRole)),
    [role],
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <div className="flex h-full flex-col">
      {/* Header / Brand */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold text-foreground"
          >
            Referral Creator
          </motion.span>
        )}
        {collapsed && (
          <span className="mx-auto text-lg font-bold text-foreground">RC</span>
        )}
      </div>

      {/* Navigation items */}
      <nav
        className="flex-1 overflow-y-auto px-2 py-4"
        aria-label="Main navigation"
      >
        <ul className="flex flex-col gap-1">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      // Use Next.js router via href
                      window.location.href = item.href;
                      onNavigate();
                    }
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:bg-default hover:text-foreground"
                  } ${collapsed ? "justify-center" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="size-5 shrink-0" />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info & logout */}
      <div className="border-t border-border p-3">
        <Button
          variant="secondary"
          className={`w-full ${collapsed ? "justify-center" : "justify-start"}`}
          onPress={handleLogout}
        >
          <LogoutIcon className="size-4 shrink-0" />
          {!collapsed && <span className="ml-2">Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop Sidebar
// ---------------------------------------------------------------------------

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useAuth();

  if (!role) return null;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative hidden h-screen flex-col border-r border-border bg-surface lg:flex"
    >
      <SidebarContent collapsed={collapsed} />

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute -right-3 top-20 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition-colors hover:text-foreground"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <motion.div
          initial={false}
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronLeftIcon className="size-4" />
        </motion.div>
      </button>
    </motion.aside>
  );
}

// ---------------------------------------------------------------------------
// Mobile Sidebar (Drawer)
// ---------------------------------------------------------------------------

interface MobileSidebarProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function MobileSidebar({ isOpen, onOpenChange }: MobileSidebarProps) {
  const { role } = useAuth();

  if (!role) return null;

  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement="left">
        <Drawer.Dialog>
          <Drawer.Header>
            <Drawer.Heading>Navegación</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body className="p-0">
            <SidebarContent
              collapsed={false}
              onNavigate={() => onOpenChange(false)}
            />
          </Drawer.Body>
          <Drawer.Footer>
            <Button className="w-full" slot="close" variant="secondary">
              Cerrar
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
