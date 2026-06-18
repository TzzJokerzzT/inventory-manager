"use client";

/**
 * useSessionTimer — tracks user inactivity and dispatches session expiry events.
 *
 * - Monitors mouse, keyboard, click, scroll, and touch events for activity
 * - Configurable timeout from SESSION_TIMEOUTS constants
 * - On timeout: fires a callback (typically to show expiry modal)
 * - Resets timer on any detected activity
 * - Pauses when user is already logged out or not authenticated
 * - Cleans up all event listeners on unmount
 */

import { useCallback, useEffect, useRef } from "react";
import { SESSION_TIMEOUTS } from "@/lib/auth/domain/value-objects";

interface UseSessionTimerOptions {
  /** Whether the timer should be active (e.g., only when authenticated) */
  isEnabled: boolean;
  /** Callback fired when inactivity timeout is reached */
  onTimeout: () => void;
  /** Inactivity timeout in ms (defaults to SESSION_TIMEOUTS.INACTIVITY_MS) */
  timeoutMs?: number;
}

interface UseSessionTimerReturn {
  /** Reset the inactivity timer manually (e.g., on explicit user action) */
  resetTimer: () => void;
}

/** Activity events that reset the inactivity timer */
const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "click",
  "scroll",
  "touchstart",
] as const;

export function useSessionTimer({
  isEnabled,
  onTimeout,
  timeoutMs = SESSION_TIMEOUTS.INACTIVITY_MS,
}: UseSessionTimerOptions): UseSessionTimerReturn {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  // Keep callback ref current without re-attaching listeners
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      onTimeoutRef.current();
    }, timeoutMs);
  }, [clearTimer, timeoutMs]);

  const resetTimer = useCallback(() => {
    if (isEnabled) {
      startTimer();
    }
  }, [isEnabled, startTimer]);

  // Activity handler — resets the timer on any activity event
  const handleActivity = useCallback(() => {
    if (isEnabled) {
      startTimer();
    }
  }, [isEnabled, startTimer]);

  // Set up activity event listeners
  useEffect(() => {
    if (!isEnabled) {
      clearTimer();
      return;
    }

    // Start initial timer
    startTimer();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      clearTimer();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [isEnabled, handleActivity, startTimer, clearTimer]);

  return { resetTimer };
}
