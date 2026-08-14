"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

import { isBodyScrollLocked, subscribeBodyScrollLock } from "../../lib/use-body-scroll-lock";
import { Box } from "../box/box";

const FADE_DISTANCE = 160;

const TINT_STOPS = [
  [0, 0.92],
  [18, 0.87],
  [38, 0.74],
  [55, 0.55],
  [70, 0.35],
  [82, 0.18],
  [92, 0.06],
  [100, 0],
] as const;

const TINT_GRADIENT = `linear-gradient(to bottom, ${TINT_STOPS.map(
  ([position, alpha]) =>
    `rgb(var(--veil-rgb) / calc(${alpha} * var(--veil-strength))) ${position}%`,
).join(", ")})`;

/** Readability scrim that grows in behind the sticky header as the page scrolls. */
export function HeaderScrollVeil() {
  const veilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const veil = veilRef.current;
    if (!veil) {
      return;
    }

    let raf = 0;

    const update = () => {
      raf = 0;
      if (isBodyScrollLocked()) {
        return;
      }
      const progress = Math.min(1, Math.max(0, window.scrollY / FADE_DISTANCE));
      veil.style.setProperty("--veil-progress", progress.toFixed(3));
    };

    const schedule = () => {
      if (raf) {
        return;
      }
      raf = requestAnimationFrame(update);
    };

    update();
    const unsubscribe = subscribeBodyScrollLock(update);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      unsubscribe();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  return (
    <Box
      ref={veilRef}
      aria-hidden="true"
      data-testid="header-scroll-veil"
      style={{ "--veil-progress": "0", backgroundImage: TINT_GRADIENT } as CSSProperties}
      css={{
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        zIndex: -1,
        height: "calc(100% + 1.5rem)",
        opacity: "var(--veil-progress, 0)",
        pointerEvents: "none",
        userSelect: "none",
        "--veil-rgb": "255 255 255",
        "--veil-strength": "1",
        _pageDark: { "--veil-rgb": "0 0 0", "--veil-strength": "1.08" },
      }}
    />
  );
}
HeaderScrollVeil.displayName = "HeaderScrollVeil";
