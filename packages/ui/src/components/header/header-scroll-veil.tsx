"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

import { Box } from "../box/box";

const FADE_DISTANCE = 160;

const BLUR_LAYERS = [
  { blur: 1, solid: 70, end: 106 },
  { blur: 2, solid: 55, end: 92 },
  { blur: 4, solid: 38, end: 75 },
  { blur: 8, solid: 20, end: 55 },
] as const;

const FADE_CURVE = [
  [0, 1],
  [0.2, 0.94],
  [0.4, 0.77],
  [0.6, 0.5],
  [0.8, 0.22],
  [1, 0],
] as const;

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
      const progress = Math.min(1, Math.max(0, window.scrollY / FADE_DISTANCE));
      veil.style.setProperty("--veil-progress", progress.toFixed(3));
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
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        zIndex: -1,
        height: "calc(100% + 4rem)",
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

function fadeStops(solid: number, end: number): string {
  const span = end - solid;
  return FADE_CURVE.map(
    ([position, alpha]) => `rgb(0 0 0 / ${alpha}) ${(solid + position * span).toFixed(1)}%`,
  ).join(", ");
}
