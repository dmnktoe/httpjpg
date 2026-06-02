"use client";

import { useMemo } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { OVERLAY_PATTERNS, type OverlayPattern, pickPattern } from "./patterns";

export interface ImageOverlayProps {
  /**
   * Pattern to render. `"random"` picks one deterministically from `seed`,
   * `"none"` renders nothing.
   * @default "random"
   */
  pattern?: OverlayPattern;
  /** Seed for the `"random"` picker so the same image gets the same pattern. */
  seed?: string;
  /** Base font size for particles. @default "1rem" */
  size?: string;
  /** Color of the particles. Accepts any CSS color or a CSS variable. */
  color?: string;
  /** Master opacity multiplier. @default 0.7 */
  opacity?: number;
  /**
   * Push particles inward by this percentage so they sit on the image
   * instead of hugging the edges. @default 0
   */
  inset?: number;
  css?: SystemStyleObject;
}

export function ImageOverlay({
  pattern = "random",
  seed,
  size = "1rem",
  color = "currentColor",
  opacity = 0.7,
  inset = 0,
  css: cssProp,
}: ImageOverlayProps) {
  const resolvedPattern = useMemo<Exclude<OverlayPattern, "random">>(() => {
    if (pattern === "random") {
      return pickPattern(seed);
    }
    if (pattern !== "none" && !Object.hasOwn(OVERLAY_PATTERNS, pattern)) {
      return pickPattern(seed);
    }
    return pattern;
  }, [pattern, seed]);

  if (resolvedPattern === "none") {
    return null;
  }

  const particles = OVERLAY_PATTERNS[resolvedPattern];

  const insetValue = inset > 0 ? `${inset}%` : "0";

  return (
    <Box
      aria-hidden="true"
      css={{
        position: "absolute",
        pointerEvents: "none",
        zIndex: 1,
        ...cssProp,
      }}
      style={{ top: insetValue, right: insetValue, bottom: insetValue, left: insetValue }}
      data-overlay-pattern={resolvedPattern}
    >
      {particles.map((p, i) => (
        <Box
          // biome-ignore lint: positional + char is enough of a key in a static array
          key={`${p.char}-${i}`}
          as="span"
          css={{
            position: "absolute",
            fontFamily: "mono",
            fontWeight: "bold",
            userSelect: "none",
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            fontSize: p.scale ? `calc(${size} * ${p.scale})` : size,
            color,
            opacity: (p.opacity ?? 1) * opacity,
            transform: p.rotate ? `rotate(${p.rotate}deg)` : undefined,
          }}
        >
          {p.char}
        </Box>
      ))}
    </Box>
  );
}

ImageOverlay.displayName = "ImageOverlay";

export { type OverlayPattern, OVERLAY_PATTERNS, pickPattern } from "./patterns";
