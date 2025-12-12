"use client";

import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export type CopyrightPosition =
  | "below"
  | "overlay"
  | "vertical-right"
  | "inline";

export interface CopyrightLabelProps {
  /**
   * Copyright text (without © symbol, will be added automatically)
   */
  text: string;
  /**
   * Position variant
   * @default "below"
   */
  position?: CopyrightPosition;
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

/**
 * CopyrightLabel component - Displays copyright information
 *
 * A reusable component for displaying copyright notices in various positions.
 * Automatically adds the © symbol to the text.
 *
 * @example
 * ```tsx
 * // Below content
 * <CopyrightLabel text="John Doe" position="below" />
 *
 * // Overlay at bottom
 * <CopyrightLabel text="Jane Smith" position="overlay" />
 *
 * // Inline vertical on right (for images)
 * <CopyrightLabel text="Photographer" position="inline" />
 *
 * // Vertical text on right side (for slideshows)
 * <CopyrightLabel text="Photographer Name" position="vertical-right" />
 * ```
 */
export function CopyrightLabel({
  text,
  position = "below",
  css: cssProp,
}: CopyrightLabelProps) {
  if (!text) {
    return null;
  }

  // Overlay position (e.g., for videos)
  if (position === "overlay") {
    return (
      <Box
        css={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background:
            "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
          p: 4,
          fontFamily: "sans",
          fontSize: "sm",
          opacity: 0.7,
          color: "white",
          boxSizing: "border-box",
          pointerEvents: "none",
          zIndex: 10,
          ...cssProp,
        }}
      >
        © {text}
      </Box>
    );
  }

  // Vertical right position (e.g., for slideshow)
  if (position === "vertical-right") {
    return (
      <Box
        css={{
          position: "absolute",
          right: 2,
          bottom: 2,
          px: 1,
          py: 2,
          fontFamily: "sans",
          fontSize: "sm",
          opacity: 0.7,
          color: "white",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          whiteSpace: "nowrap",
          zIndex: 10,
          pointerEvents: "none",
          ...cssProp,
        }}
      >
        © {text}
      </Box>
    );
  }

  // Inline position (vertical on right side, e.g., for images)
  if (position === "inline") {
    return (
      <Box
        css={{
          position: "absolute",
          bottom: 2,
          right: 2,
          px: 1,
          py: 2,
          fontFamily: "sans",
          fontSize: "sm",
          opacity: 0.7,
          color: "white",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          boxSizing: "border-box",
          zIndex: 10,
          ...cssProp,
        }}
      >
        © {text}
      </Box>
    );
  }

  // Below position (default)
  return (
    <Box
      css={{
        fontFamily: "sans",
        fontSize: "sm",
        opacity: 0.7,
        py: 2,
        color: "currentColor",
        ...cssProp,
      }}
    >
      © {text}
    </Box>
  );
}
