"use client";

/**
 * Mock auth wrapper — provides the mock IAuthRepository to AuthProvider.
 *
 * Use this in development when no backend is running.
 * Activated by NEXT_PUBLIC_MOCK_AUTH=true in .env.local
 */

import type { ReactNode } from "react";
import { mockAuthRepository } from "@/lib/auth/infrastructure/mock-auth-repository";
import { AuthProvider } from "@/lib/auth/presentation/auth-provider";

interface MockAuthWrapperProps {
  children: ReactNode;
}

export function MockAuthWrapper({ children }: MockAuthWrapperProps) {
  return (
    <AuthProvider repository={mockAuthRepository}>{children}</AuthProvider>
  );
}
