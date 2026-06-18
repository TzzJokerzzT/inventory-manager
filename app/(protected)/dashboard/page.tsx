/**
 * Dashboard page — generic post-login landing page.
 *
 * Displays a welcome message with the user's name and role.
 * This is a Server Component-friendly placeholder that will be
 * enhanced with actual dashboard content in Phase 4.
 */

"use client";

import { useAuth } from "@/lib/auth/presentation/auth-provider";

export default function DashboardPage() {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-sm font-medium text-muted">Your Role</h2>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {role ? role.replace("_", " ") : "Unknown"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-sm font-medium text-muted">Status</h2>
          <p className="mt-1 text-lg font-semibold text-foreground">Active</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-sm font-medium text-muted">Email</h2>
          <p className="mt-1 text-lg font-semibold text-foreground truncate">
            {user?.email ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
