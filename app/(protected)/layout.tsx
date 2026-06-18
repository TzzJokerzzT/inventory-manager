"use client";

/**
 * Protected layout — wraps all authenticated routes.
 *
 * - Verifies authentication state on mount
 * - Redirects to /login if not authenticated
 * - Checks role authorization for the current route
 * - Shows loading state while session is being verified
 * - Placeholder layout structure (sidebar/navbar coming in Phase 4)
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "@heroui/react";
import { useAuth } from "@/lib/auth/presentation/auth-provider";
import { hasPermission } from "@/lib/auth/domain/value-objects";
import type { Role } from "@/lib/auth/domain/entities";

/**
 * Map of route prefixes to minimum required roles.
 * Routes not listed here are accessible to all authenticated users.
 */
const ROUTE_ROLE_MAP: Record<string, Role> = {
  // Add specific route role requirements here in Phase 4
  // e.g., "/dashboard/settings": "admin",
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
    <div className="min-h-screen bg-background">
      {/* Placeholder layout — sidebar and navbar coming in Phase 4 */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
