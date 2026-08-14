"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

import { isBodyScrollLocked, subscribeBodyScrollLock } from "../../lib/use-body-scroll-lock";
import { Box } from "../box/box";

const FADE_DISTANCE = 160;

const BLUR_LAYERS = [
  { blur: 1, solid: 42, end: 100 },
  { blur: 2, solid: 30, end: 86 },
  { blur: 4, solid: 18, end: 70 },
  { blur: 8, solid: 6, end: 50 },
] as const;

const FADE_CURVE = [
  [0, 1],
  [0.15, 0.96],
  [0.3, 0.87],
  [0.45, 0.73],
  [0.6, 0.54],
  [0.72, 0.37],
  [0.84, 0.19],
  [0.93, 0.07],
  [1, 0],
] as const;

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

export interface HeaderScrollVeilProps {
  /** Sticky header height in px. The fade continues 1.5rem past it. */
  height?: number;
}

/**
 * Frost + tint behind the sticky header. Lives as a `position: fixed` sibling
 * so `backdrop-filter` is not inside `position: sticky` (that pairing is what
 * made ⇝HELLO jump and then vanish). Blur layers stay mounted — toggling
 * `display` is what snapped the header at ~160px of scroll.
 */
export function HeaderScrollVeil({ height = 0 }: HeaderScrollVeilProps) {
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
        veil.style.setProperty("--veil-blur", "0");
        return;
      }
      const progress = Math.min(1, Math.max(0, window.scrollY / FADE_DISTANCE));
      veil.style.setProperty("--veil-progress", progress.toFixed(3));
      veil.style.setProperty("--veil-blur", (progress * progress).toFixed(3));
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
      style={
        {
          "--veil-progress": "0",
          "--veil-blur": "0",
          height: `calc(${height}px + 1.5rem)`,
        } as CSSProperties
      }
      css={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: "header",
        pointerEvents: "none",
        userSelect: "none",
        "--veil-rgb": "255 255 255",
        "--veil-strength": "1",
        _pageDark: { "--veil-rgb": "0 0 0", "--veil-strength": "1.08" },
      }}
    >
      <Box
        css={{
          position: "absolute",
          inset: 0,
          "@media (prefers-reduced-transparency: reduce)": { display: "none" },
        }}
      >
        {BLUR_LAYERS.map((layer) => (
          <Box
            key={layer.blur}
            css={{ position: "absolute", inset: 0 }}
            style={maskedBlurStyle(layer.blur, layer.solid, layer.end)}
          />
        ))}
      </Box>

      <Box
        css={{
          position: "absolute",
          inset: 0,
          opacity: "var(--veil-progress, 0)",
        }}
        style={{ backgroundImage: TINT_GRADIENT }}
      />
    </Box>
  );
}
HeaderScrollVeil.displayName = "HeaderScrollVeil";

function maskedBlurStyle(blur: number, solid: number, end: number): CSSProperties {
  const filter = `blur(calc(var(--veil-blur, 0) * ${blur}px))`;
  const mask = `linear-gradient(to bottom, #000 0%, ${fadeStops(solid, end)})`;
  return {
    backdropFilter: filter,
    WebkitBackdropFilter: filter,
    maskImage: mask,
    WebkitMaskImage: mask,
  } as CSSProperties;
}

function fadeStops(solid: number, end: number): string {
  const span = end - solid;
  return FADE_CURVE.map(
    ([position, alpha]) => `rgb(0 0 0 / ${alpha}) ${(solid + position * span).toFixed(1)}%`,
  ).join(", ");
}
