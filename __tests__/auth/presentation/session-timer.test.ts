/**
 * Tests for useSessionTimer hook.
 *
 * Validates inactivity detection, timer reset, and event listener cleanup.
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Must import AFTER the mock setup
import { useSessionTimer } from "@/lib/auth/presentation/use-session-timer";

describe("useSessionTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts the inactivity timer when enabled", () => {
    const onTimeout = vi.fn();
    renderHook(() => useSessionTimer({ isEnabled: true, onTimeout }));

    // Timer should not have fired yet
    expect(onTimeout).not.toHaveBeenCalled();

    // Advance past default timeout (30 min)
    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it("does not start the timer when disabled", () => {
    const onTimeout = vi.fn();
    renderHook(() => useSessionTimer({ isEnabled: false, onTimeout }));

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("resets the timer on activity events", () => {
    const onTimeout = vi.fn();
    renderHook(() => useSessionTimer({ isEnabled: true, onTimeout }));

    // Advance 20 minutes (not yet timed out)
    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    expect(onTimeout).not.toHaveBeenCalled();

    // Simulate user activity (mousemove)
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    // Advance another 20 minutes — should NOT have timed out
    // because the timer was reset by the activity
    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    // Still not timed out (because reset happened at 20min, needs 30min from there)
    expect(onTimeout).not.toHaveBeenCalled();

    // Advance to 30min from the reset point
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it("cleans up event listeners on unmount", () => {
    const onTimeout = vi.fn();
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useSessionTimer({ isEnabled: true, onTimeout }),
    );

    unmount();

    // Check that event listeners were removed
    expect(removeSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("click", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("touchstart", expect.any(Function));

    removeSpy.mockRestore();
  });

  it("uses custom timeout when provided", () => {
    const onTimeout = vi.fn();
    const customTimeout = 5 * 60 * 1000; // 5 minutes

    renderHook(() =>
      useSessionTimer({ isEnabled: true, onTimeout, timeoutMs: customTimeout }),
    );

    // Advance 4 minutes — not yet timed out
    act(() => {
      vi.advanceTimersByTime(4 * 60 * 1000);
    });
    expect(onTimeout).not.toHaveBeenCalled();

    // Advance 1 more minute — should time out
    act(() => {
      vi.advanceTimersByTime(1 * 60 * 1000);
    });
    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it("stops the timer when disabled after being enabled", () => {
    const onTimeout = vi.fn();

    const { rerender } = renderHook(
      ({ isEnabled }: { isEnabled: boolean }) =>
        useSessionTimer({ isEnabled, onTimeout }),
      { initialProps: { isEnabled: true } },
    );

    // Disable the timer
    rerender({ isEnabled: false });

    // Advance past the timeout — should NOT fire
    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("provides a resetTimer function that resets the timer", () => {
    const onTimeout = vi.fn();

    const { result } = renderHook(() =>
      useSessionTimer({ isEnabled: true, onTimeout }),
    );

    // Advance 20 minutes
    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    // Manually reset
    act(() => {
      result.current.resetTimer();
    });

    // Advance another 20 minutes — should NOT have timed out
    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000);
    });

    expect(onTimeout).not.toHaveBeenCalled();

    // Advance 10 more minutes — total reset+30 = timeout
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(onTimeout).toHaveBeenCalledOnce();
  });
});
