"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

import { Box } from "../box/box";

/** Scroll distance (px) the veil ramps from fully invisible to fully on. */
const FADE_DISTANCE = 120;

/**
 * Progressive blur ladder, top-heavy. Each layer blurs everything painted
 * before it — including the previous layer — so the blur compounds towards
 * the top edge and is gone by the bottom of the veil. Same trick as the iOS
 * scroll-edge effect: no visible seam, just a gradient of sharpness.
 */
const BLUR_LAYERS = [
  { blur: 1, solid: 87.5, end: 100 },
  { blur: 2, solid: 62.5, end: 87.5 },
  { blur: 4, solid: 37.5, end: 62.5 },
  { blur: 8, solid: 12.5, end: 37.5 },
] as const;

/**
 * Alpha ramp of the tint. Deliberately more stops than a two-stop gradient
 * needs: a linear fade reads as a hard band against ASCII text, these
 * approximate an ease-out curve instead.
 */
const TINT_STOPS = [
  [0, 0.92],
  [20, 0.86],
  [40, 0.7],
  [60, 0.46],
  [80, 0.2],
  [100, 0],
] as const;

const TINT_GRADIENT = `linear-gradient(to bottom, ${TINT_STOPS.map(
  ([position, alpha]) =>
    `rgb(var(--veil-rgb) / calc(${alpha} * var(--veil-strength))) ${position}%`,
).join(", ")})`;

/**
 * Readability scrim behind the sticky header. Invisible at the top of the
 * page, it fades in linearly over the first {@link FADE_DISTANCE} pixels of
 * scroll so page content passing underneath never collides with the nav.
 *
 * The tint colour follows `pageBg` through `data-theme`, so it stays white on
 * light pages and black on dark ones without the caller knowing which is which.
 */
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
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
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
      style={{ "--veil-progress": "0" } as CSSProperties}
      css={{
        "--veil-rgb": "255 255 255",
        "--veil-strength": "1",
        _pageDark: {
          // Dark surfaces need a touch more scrim: light text on a light
          // photo is harder to rescue than dark text on a light one.
          "--veil-rgb": "0 0 0",
          "--veil-strength": "1.08",
        },
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        zIndex: -1,
        // Overshoot the header box so the fade tail lands in empty space
        // instead of ending on the last line of nav text.
        height: "calc(100% + 2.5rem)",
        opacity: "var(--veil-progress, 0)",
        transition: "opacity 90ms linear",
        pointerEvents: "none",
        userSelect: "none",
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

      <Box css={{ position: "absolute", inset: 0 }} style={{ backgroundImage: TINT_GRADIENT }} />
    </Box>
  );
}
HeaderScrollVeil.displayName = "HeaderScrollVeil";

function maskedBlurStyle(blur: number, solid: number, end: number): CSSProperties {
  const filter = `blur(${blur}px)`;
  const mask = `linear-gradient(to bottom, #000 0%, #000 ${solid}%, transparent ${end}%)`;
  return {
    backdropFilter: filter,
    WebkitBackdropFilter: filter,
    maskImage: mask,
    WebkitMaskImage: mask,
  } as CSSProperties;
}
