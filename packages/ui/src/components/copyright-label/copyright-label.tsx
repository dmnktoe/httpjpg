"use client";

import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export type CopyrightPosition =
  | "below"
  | "overlay"
  | "inline-black"
  | "inline-white";

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
 * // Inline white (for dark images/slideshows)
 * <CopyrightLabel text="Photographer" position="inline-white" />
 *
 * // Inline black (for bright images)
 * <CopyrightLabel text="Photographer Name" position="inline-black" />
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

  // Inline black position (vertical on right side, for bright images)
  if (position === "inline-black") {
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
          color: "black",
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

  // Inline white position (vertical on right side, for dark images)
  if (position === "inline-white") {
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
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          zIndex: 10,
          pointerEvents: "none",
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
