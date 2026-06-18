"use client";

/**
 * Register page — creates a new user account.
 *
 * - Uses HeroUI v3 compound components (Card, Form, TextField, Button)
 * - Validates with Valibot RegisterSchema (includes email domain whitelist)
 * - Shows domain whitelist error if email domain is not allowed
 * - On success, redirects to /login with a success message
 * - Redirects already-authenticated users to /dashboard
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
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as v from "valibot";
import { RegisterSchema } from "@/lib/auth/domain/schemas";
import { ALLOWED_EMAIL_DOMAINS } from "@/lib/auth/domain/value-objects";
import { useAuth } from "@/lib/auth/presentation/auth-provider";
import { MailIcon, UserIcon } from "@/lib/icons";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" />
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();
  const nameRef = useRef<HTMLInputElement>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Show success message if redirected from registration
  const successMessage = searchParams.get("registered");

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Auto-focus name field on mount
  useEffect(() => {
    nameRef.current?.focus();
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
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
      };

      // Confirm password match
      if (data.password !== data.confirmPassword) {
        setFormErrors({ confirmPassword: "Passwords do not match" });
        return;
      }

      // Client-side validation with Valibot
      const result = v.safeParse(RegisterSchema, data);
      if (!result.success) {
        const errors: Record<string, string> = {};
        for (const issue of result.issues) {
          const path = issue.path?.[0]?.key;
          if (typeof path === "string") {
            errors[path] = issue.message;
          } else {
            // Fallback: assign to first available field
            errors.email = errors.email ?? issue.message;
          }
        }
        setFormErrors(errors);
        return;
      }

      try {
        await register({
          email: result.output.email,
          password: result.output.password,
          name: result.output.name,
        });
        // Registration successful — redirect to login
        router.push("/login?registered=true");
      } catch {
        // Error is already stored in auth state
      }
    },
    [register, clearError, router, formValues],
  );

  const domainHint = `Allowed domains: ${ALLOWED_EMAIL_DOMAINS.join(", ")}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <Card.Header>
          <Card.Title>Create Account</Card.Title>
          <Card.Description>
            Register with an email from {ALLOWED_EMAIL_DOMAINS.join(", ")}
          </Card.Description>
        </Card.Header>

        <form onSubmit={handleSubmit}>
          <Card.Content>
            <div className="flex flex-col gap-4">
              <TextField name="name" type="text" isRequired>
                <Label>Full Name</Label>
                <Input
                  ref={nameRef}
                  placeholder="John Doe"
                  variant="secondary"
                  autoComplete="name"
                  value={formValues.name}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <FieldError />
              </TextField>

              <TextField
                name="email"
                type="email"
                isRequired
                validate={(value: string) => {
                  if (
                    value &&
                    !ALLOWED_EMAIL_DOMAINS.some((d) => value.endsWith(`@${d}`))
                  ) {
                    return `Email domain not allowed. ${domainHint}`;
                  }
                  return null;
                }}
              >
                <Label>Email</Label>
                <Input
                  placeholder="you@gmail.com"
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

              <TextField
                name="password"
                type={showPassword ? "text" : "password"}
                isRequired
              >
                <Label>Password</Label>
                <Input
                  placeholder="••••••••"
                  variant="secondary"
                  autoComplete="new-password"
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

              <TextField name="confirmPassword" type="password" isRequired>
                <Label>Confirm Password</Label>
                <Input
                  placeholder="••••••••"
                  variant="secondary"
                  autoComplete="new-password"
                  value={formValues.confirmPassword}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
                <FieldError />
              </TextField>

              {formErrors.name && (
                <p className="text-sm text-danger" role="alert">
                  {formErrors.name}
                </p>
              )}
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
              {formErrors.confirmPassword && (
                <p className="text-sm text-danger" role="alert">
                  {formErrors.confirmPassword}
                </p>
              )}
              {error && (
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              )}
              {successMessage && (
                <output className="text-sm text-success">
                  Account created! Please sign in.
                </output>
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
                    <UserIcon className="size-4" />
                  ) : (
                    <UserIcon className="size-4" />
                  )}
                  {isPending ? "Creating account..." : "Create Account"}
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-sm">
                Sign in
              </Link>
            </p>
          </Card.Footer>
        </form>
      </Card>
    </div>
  );
}
