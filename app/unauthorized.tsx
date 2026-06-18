/**
 * 401 Unauthorized error page.
 *
 * Displayed when a user tries to access a protected resource
 * without being authenticated. Shows a link to the login page.
 */

import { Link } from "@heroui/react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground">401</h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          Unauthorized
        </h2>
        <p className="mt-2 text-sm text-muted">
          Please log in to access this page.
        </p>
      </div>

      <Link
        href="/login"
        className="mt-4 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go to Login
      </Link>
    </div>
  );
}
