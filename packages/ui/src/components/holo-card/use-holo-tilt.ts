"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  DEFAULT_MAX_TILT,
  type HoloState,
  holoVars,
  idlePoint,
  isSettled,
  type Orientation,
  pointFromOrientation,
  pointFromRect,
  REST_STATE,
  RETURN_DELAY_MS,
  RETURN_SMOOTHING,
  SMOOTHING,
  stateFromPoint,
  stepState,
} from "./lib";

export type GyroPermission = "unsupported" | "prompt" | "granted" | "denied";

export interface UseHoloTiltOptions {
  /** Max rotation on either axis in degrees. @default 18 */
  maxTilt?: number;
  /** Master strength of the foil / glare layers (0–1). @default 0.8 */
  intensity?: number;
  /** Drift slowly while nothing touches the card. @default true */
  idle?: boolean;
  /** Follow the device gyroscope on phones. @default true */
  gyro?: boolean;
  /** Freeze at rest (reduced motion). @default false */
  disabled?: boolean;
  /** Called with every eased state the loop writes (e.g. to repaint a canvas). */
  onFrame?: (state: HoloState, time: number) => void;
}

/** Idle drift is a fraction of the interactive tilt so it reads as a shimmer, not a wobble. */
const IDLE_TILT_SCALE = 0.35;

interface OrientationEventCtor {
  requestPermission?: () => Promise<"granted" | "denied">;
}

function subscribeNoop() {
  return () => {};
}

function getServerPermission(): GyroPermission {
  return "unsupported";
}

function detectGyroPermission(): GyroPermission {
  if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
    return "unsupported";
  }
  const ctor = window.DeviceOrientationEvent as unknown as OrientationEventCtor;
  return typeof ctor.requestPermission === "function" ? "prompt" : "granted";
}

/**
 * Drives the `--holo-*` custom properties on the returned element from the
 * pointer, the device gyroscope, or a slow idle drift. All motion runs through
 * one rAF loop that eases toward the current target and sleeps once settled
 * or off-screen. Leaving the card holds the pose briefly, then eases back
 * more slowly than it followed, so the snap back reads like a spring.
 */
export function useHoloTilt<T extends HTMLElement = HTMLDivElement>({
  maxTilt = DEFAULT_MAX_TILT,
  intensity = 0.8,
  idle = true,
  gyro = true,
  disabled = false,
  onFrame,
}: UseHoloTiltOptions = {}) {
  const ref = useRef<T>(null);
  const onFrameRef = useRef(onFrame);
  // The server never knows about the gyroscope; the client snapshot takes over after hydration.
  const detectedPermission = useSyncExternalStore(
    subscribeNoop,
    detectGyroPermission,
    getServerPermission,
  );
  const [answeredPermission, setAnsweredPermission] = useState<GyroPermission | null>(null);
  const gyroPermission = answeredPermission ?? detectedPermission;

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  const requestGyro = useCallback(async () => {
    const ctor = (typeof window === "undefined" ? undefined : window.DeviceOrientationEvent) as
      | OrientationEventCtor
      | undefined;
    if (!ctor || typeof ctor.requestPermission !== "function") {
      return;
    }
    try {
      const result = await ctor.requestPermission();
      setAnsweredPermission(result === "granted" ? "granted" : "denied");
    } catch {
      setAnsweredPermission("denied");
    }
  }, []);

  const gyroEnabled = gyro && gyroPermission === "granted";

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const apply = (state: HoloState, time: number) => {
      for (const [name, value] of Object.entries(holoVars(state, intensity))) {
        el.style.setProperty(name, value);
      }
      onFrameRef.current?.(state, time);
    };

    if (disabled) {
      apply(REST_STATE, 0);
      return;
    }

    let current: HoloState = { ...REST_STATE };
    let pointerTarget: HoloState | null = null;
    let gyroTarget: HoloState | null = null;
    let baseline: Orientation | null = null;
    let inView = false;
    let rafId = 0;
    let releaseTimer = 0;
    // Set when the pointer leaves: eases back slowly until something drives the card again.
    let isReturning = false;
    const startedAt = performance.now();

    apply(current, 0);

    const targetState = (now: number): HoloState => {
      if (pointerTarget) {
        return pointerTarget;
      }
      if (gyroTarget) {
        return gyroTarget;
      }
      if (idle) {
        const drift = stateFromPoint(
          idlePoint((now - startedAt) / 1000),
          maxTilt * IDLE_TILT_SCALE,
          0,
        );
        return { ...drift, active: 0, dist: 0 };
      }
      return REST_STATE;
    };

    const frame = (now: number) => {
      rafId = 0;
      if (!inView) {
        return;
      }
      const target = targetState(now);
      current = stepState(current, target, isReturning ? RETURN_SMOOTHING : SMOOTHING);
      apply(current, (now - startedAt) / 1000);
      const settled = isSettled(current, target);
      if (settled) {
        isReturning = false;
      }
      const keepGoing = idle || pointerTarget || gyroTarget || !settled;
      if (keepGoing) {
        rafId = requestAnimationFrame(frame);
      }
    };

    const wake = () => {
      if (rafId === 0 && inView) {
        rafId = requestAnimationFrame(frame);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      window.clearTimeout(releaseTimer);
      isReturning = false;
      const rect = el.getBoundingClientRect();
      pointerTarget = stateFromPoint(pointFromRect(event.clientX, event.clientY, rect), maxTilt);
      wake();
    };

    const handlePointerLeave = () => {
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => {
        pointerTarget = null;
        isReturning = true;
        wake();
      }, RETURN_DELAY_MS);
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) {
        return;
      }
      const reading = { beta: event.beta, gamma: event.gamma };
      baseline ??= reading;
      isReturning = false;
      gyroTarget = stateFromPoint(pointFromOrientation(reading, baseline), maxTilt);
      wake();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView = entry.isIntersecting;
        }
        if (inView) {
          wake();
        } else {
          // Re-centre on the next reading so a phone picked up at a new angle
          // starts from rest instead of pinned to one edge.
          baseline = null;
        }
      },
      { rootMargin: "50px" },
    );
    observer.observe(el);

    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);
    el.addEventListener("pointercancel", handlePointerLeave);
    if (gyroEnabled) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      observer.disconnect();
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
      el.removeEventListener("pointercancel", handlePointerLeave);
      window.removeEventListener("deviceorientation", handleOrientation);
      window.clearTimeout(releaseTimer);
      cancelAnimationFrame(rafId);
    };
  }, [maxTilt, intensity, idle, disabled, gyroEnabled]);

  return {
    ref,
    /** True on devices that gate the gyroscope behind a tap (iOS). */
    needsGyroPermission: gyro && !disabled && gyroPermission === "prompt",
    requestGyro,
  };
}
