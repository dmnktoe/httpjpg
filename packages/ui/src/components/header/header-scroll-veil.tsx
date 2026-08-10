"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

import { Box } from "../box/box";

/** Scroll distance (px) the veil ramps from fully invisible to fully on. */
const FADE_DISTANCE = 160;

/**
 * Progressive blur ladder, top-heavy. Each layer blurs everything painted
 * before it — including the previous layer — so the blur compounds towards
 * the top edge and is gone by the bottom of the veil. Same trick as the iOS
 * scroll-edge effect: no visible seam, just a gradient of sharpness.
 *
 * The bands overlap heavily and each one fades over roughly half the veil,
 * because a mask that drops off quickly turns the blur into a visible edge.
 */
const BLUR_LAYERS = [
  { blur: 1, solid: 70, end: 106 },
  { blur: 2, solid: 55, end: 92 },
  { blur: 4, solid: 38, end: 75 },
  { blur: 8, solid: 20, end: 55 },
] as const;

/**
 * Alpha ramp every mask fade runs through. Deliberately more stops than a
 * gradient needs: a linear fade reads as a hard band against ASCII text,
 * these approximate an ease-out curve instead.
 */
const FADE_CURVE = [
  [0, 1],
  [0.2, 0.94],
  [0.4, 0.77],
  [0.6, 0.5],
  [0.8, 0.22],
  [1, 0],
] as const;

/**
 * The tint holds near full strength across the nav copy and only lets go
 * below it, so the header reads against a flat surface rather than a ramp.
 */
const TINT_STOPS = [
  [0, 0.92],
  [35, 0.88],
  [55, 0.72],
  [70, 0.48],
  [85, 0.21],
  [100, 0],
] as const;

const TINT_GRADIENT = `linear-gradient(to bottom, ${TINT_STOPS.map(
  ([position, alpha]) =>
    `rgb(var(--veil-rgb) / calc(${alpha} * var(--veil-strength))) ${position}%`,
).join(", ")})`;

/**
 * Readability scrim behind the sticky header. Invisible at the top of the
 * page, it grows in linearly over the first {@link FADE_DISTANCE} pixels of
 * scroll so page content passing underneath never collides with the nav.
 *
 * The blur is driven by its own radius rather than by opacity — a fully
 * blurred layer faded in still arrives as blur, so it has to start at 0px
 * and grow. The tint colour follows `pageBg` through `data-theme`, so it
 * stays white on light pages and black on dark ones without the caller
 * knowing which is which.
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
      // Squared, so the first pixels of scroll barely blur at all and the
      // radius eases up instead of snapping to its full strength.
      veil.style.setProperty("--veil-blur", (progress * progress).toFixed(3));
      veil.dataset.veilIdle = progress === 0 ? "true" : "false";
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
      data-veil-idle="true"
      style={{ "--veil-progress": "0", "--veil-blur": "0" } as CSSProperties}
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
        height: "calc(100% + 4rem)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <Box
        css={{
          position: "absolute",
          inset: 0,
          // Nothing to blur at the top of the page — skip the compositing
          // layers entirely until the first scroll.
          "[data-veil-idle=true] &": { display: "none" },
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
          transition: "opacity 90ms linear",
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

/** Eased alpha stops carrying a mask from opaque at `solid%` to clear at `end%`. */
function fadeStops(solid: number, end: number): string {
  const span = end - solid;
  return FADE_CURVE.map(
    ([position, alpha]) => `rgb(0 0 0 / ${alpha}) ${(solid + position * span).toFixed(1)}%`,
  ).join(", ");
}
