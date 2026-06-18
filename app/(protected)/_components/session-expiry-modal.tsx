"use client";

/**
 * SessionExpiryModal — non-dismissable modal shown when session expires.
 *
 * - Triggered by session_expired event from http-client or inactivity timer
 * - Shows "Tu sesión ha expirado" message
 * - Non-dismissable: cannot close via backdrop click or Escape key
 * - Single action button: "Volver al login" clears auth state and redirects to /login
 * - Uses Motion for entrance animation (fade + scale)
 */

import { Button, Modal } from "@heroui/react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAuth } from "@/lib/auth/presentation/auth-provider";
import { AlertTriangleIcon } from "@/lib/icons";

interface SessionExpiryModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean;
}

export function SessionExpiryModal({ isOpen }: SessionExpiryModalProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleGoToLogin = useCallback(async () => {
    // Clear all auth state and redirect to login
    await logout();
    router.push("/login");
  }, [logout, router]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal.Backdrop
          isDismissable={false}
          isKeyboardDismissDisabled
          isOpen={isOpen}
        >
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Modal.Header className="items-center text-center">
                  <Modal.Icon className="bg-danger-soft text-danger-soft-foreground">
                    <AlertTriangleIcon className="size-5" />
                  </Modal.Icon>
                  <Modal.Heading>Sesión Expirada</Modal.Heading>
                  <p className="mt-1.5 text-sm leading-5 text-muted">
                    Tu sesión ha expirado por inactividad. Por favor, inicia
                    sesión de nuevo.
                  </p>
                </Modal.Header>
                <Modal.Footer>
                  <Button className="w-full" onPress={handleGoToLogin}>
                    Volver al login
                  </Button>
                </Modal.Footer>
              </motion.div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      )}
    </AnimatePresence>
  );
}
