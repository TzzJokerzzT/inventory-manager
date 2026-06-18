"use client";

/**
 * Login page — authenticates users with email/password.
 *
 * - Uses HeroUI v3 compound components (Card, Form, TextField, Button)
 * - Validates with Valibot LoginSchema
 * - Redirects to /dashboard on success
 * - Redirects already-authenticated users to /dashboard
 * - Shows error messages for invalid credentials or network errors
 */

import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  Link,
  TextField,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import * as v from "valibot";
import { LoginSchema } from "@/lib/auth/domain/schemas";
import { ALLOWED_EMAIL_DOMAINS } from "@/lib/auth/domain/value-objects";
import { useAuth } from "@/lib/auth/presentation/auth-provider";
import { LockIcon, MailIcon } from "@/lib/icons";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const emailRef = useRef<HTMLInputElement>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState({ email: "", password: "" });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Auto-focus email field on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Clear auth error on unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      clearError();
      setFormErrors({});

      // Use React state instead of FormData — HeroUI Input may not expose
      // native name attributes to the DOM form element
      const data = {
        email: formValues.email,
        password: formValues.password,
      };

      // Client-side validation with Valibot
      const result = v.safeParse(LoginSchema, data);
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.issues) {
          const path = issue.path?.[0]?.key;
          if (typeof path === "string") {
            errors[path] = issue.message;
          } else {
            errors.email = errors.email ?? issue.message;
          }
        }
        setFormErrors(errors);
        return;
      }

      try {
        await login({
          email: result.output.email,
          password: result.output.password,
        });
        router.push("/dashboard");
      } catch {
        // Error is already stored in auth state
      }
    },
    [login, clearError, router, formValues],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <Card.Header>
          <Card.Title>Sign In</Card.Title>
          <Card.Description>
            Enter your credentials to access your account
          </Card.Description>
        </Card.Header>

        <form onSubmit={handleSubmit}>
          <Card.Content>
            <div className="flex flex-col gap-4">
              <TextField name="email" type="email" isRequired>
                <Label>Email</Label>
                <Input
                  ref={emailRef}
                  placeholder="you@example.com"
                  variant="secondary"
                  autoComplete="email"
                  value={formValues.email}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
                <FieldError />
              </TextField>

              <TextField name="password" type="password" isRequired>
                <Label>Password</Label>
                <Input
                  placeholder="••••••••"
                  variant="secondary"
                  autoComplete="current-password"
                  value={formValues.password}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
                <FieldError />
              </TextField>

              {formErrors.email && (
                <p className="text-sm text-danger" role="alert">
                  {formErrors.email}
                </p>
              )}
              {formErrors.password && (
                <p className="text-sm text-danger" role="alert">
                  {formErrors.password}
                </p>
              )}
              {error && (
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              )}
            </div>
          </Card.Content>

          <Card.Footer className="mt-4 flex flex-col gap-3">
            <Button
              className="w-full"
              type="submit"
              isDisabled={isLoading}
              isPending={isLoading}
            >
              {({ isPending }) => (
                <>
                  {isPending ? (
                    <LockIcon className="size-4" />
                  ) : (
                    <MailIcon className="size-4" />
                  )}
                  {isPending ? "Signing in..." : "Sign In"}
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-sm">
                Create one
              </Link>
            </p>
          </Card.Footer>
        </form>
      </Card>
    </div>
  );
}
