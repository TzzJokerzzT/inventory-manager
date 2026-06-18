/**
 * 403 Forbidden error page.
 *
 * Displayed when an authenticated user tries to access a resource
 * for which they don't have the required role. Shows a link
 * back to the dashboard.
 */

import { Link } from "@heroui/react";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground">403</h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          Forbidden
        </h2>
        <p className="mt-2 text-sm text-muted">
          You don&apos;t have permission to access this page.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="mt-4 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
