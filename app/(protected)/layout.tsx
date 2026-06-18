"use client";

/**
 * Protected layout — wraps all authenticated routes.
 *
 * - Verifies authentication state on mount
 * - Redirects to /login if not authenticated
 * - Checks role authorization for the current route
 * - Shows loading state while session is being verified
 * - Includes Sidebar (desktop), MobileSidebar (mobile Drawer)
 * - Includes session timeout monitoring and session expiry modal
 */

import { Spinner } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Role } from "@/lib/auth/domain/entities";
import { hasPermission } from "@/lib/auth/domain/value-objects";
import { useAuth } from "@/lib/auth/presentation/auth-provider";
import { useSessionTimer } from "@/lib/auth/presentation/use-session-timer";
import { MenuIcon } from "@/lib/icons";
import { SessionExpiryModal } from "./_components/session-expiry-modal";
import { MobileSidebar, Sidebar } from "./_components/sidebar";

/**
 * Map of route prefixes to minimum required roles.
 * Routes not listed here are accessible to all authenticated users.
 */
const ROUTE_ROLE_MAP: Record<string, Role> = {
  "/dashboard/settings": "admin",
  "/dashboard/users": "admin",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, role } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Determine required role for the current route
  const requiredRole = useMemo(() => {
    for (const [prefix, r] of Object.entries(ROUTE_ROLE_MAP)) {
      if (pathname.startsWith(prefix)) {
        return r;
      }
    }
    return undefined;
  }, [pathname]);

  // Check if current role meets the requirement
  const hasRequiredRole = useMemo(() => {
    if (!requiredRole || !role) return true;
    return hasPermission(role, requiredRole);
  }, [requiredRole, role]);

  // Session timeout handler
  const handleSessionTimeout = useCallback(() => {
    setSessionExpired(true);
  }, []);

  // Inactivity timer — only active when authenticated
  useSessionTimer({
    isEnabled: isAuthenticated && !sessionExpired,
    onTimeout: handleSessionTimeout,
  });

  // Check authentication
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      setIsVerifying(false);
    }
  }, [isAuthenticated, isLoading, router]);

  // Check role authorization
  useEffect(() => {
    if (!isVerifying && requiredRole && !hasRequiredRole) {
      router.push("/forbidden");
    }
  }, [isVerifying, requiredRole, hasRequiredRole, router]);

  // Loading state while verifying session
  if (isLoading || isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-muted">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — will redirect, show nothing
  if (!isAuthenticated) {
    return null;
  }

  // Role guard blocking — will redirect
  if (requiredRole && !hasRequiredRole) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar (drawer) */}
      <MobileSidebar isOpen={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header with hamburger menu */}
        <header className="flex h-14 items-center border-b border-border px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex size-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-default hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <MenuIcon className="size-5" />
          </button>
          <span className="ml-3 text-lg font-bold text-foreground">
            Referral Creator
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Session expiry modal */}
      <SessionExpiryModal isOpen={sessionExpired} />
    </div>
  );
}
