"use client";

import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export type CopyrightPosition = "below" | "overlay" | "inline-black" | "inline-white";

export interface CopyrightLabelProps {
  /** Copyright text; the © symbol is prepended automatically. */
  text?: string;
  /** Asset source/credit, rendered on its own line below the copyright. */
  source?: string;
  position?: CopyrightPosition;
  css?: SystemStyleObject;
}

export function CopyrightLabel({
  text,
  source,
  position = "below",
  css: cssProp,
}: CopyrightLabelProps) {
  if (!text && !source) {
    return null;
  }

  const lines = (
    <>
      {text ? <>© {text}</> : null}
      {source ? (
        <Box as="span" css={{ display: "block" }}>
          {source}
        </Box>
      ) : null}
    </>
  );

  if (position === "overlay") {
    return (
      <Box
        as="span"
        css={{
          display: "block",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
          p: 4,
          fontFamily: "sans",
          fontSize: "sm",
          opacity: 0.7,
          color: "white",
          boxSizing: "border-box",
          pointerEvents: "none",
          zIndex: "docked",
          ...cssProp,
        }}
      >
        {lines}
      </Box>
    );
  }

  if (position === "inline-black" || position === "inline-white") {
    return (
      <Box
        as="span"
        css={{
          ...INLINE_CREDIT_STYLES,
          color: position === "inline-black" ? "black" : "white",
          ...cssProp,
        }}
      >
        {lines}
      </Box>
    );
  }

  return (
    <Box
      as="span"
      css={{
        display: "block",
        fontFamily: "sans",
        fontSize: "sm",
        opacity: 0.7,
        py: 2,
        color: "currentColor",
        ...cssProp,
      }}
    >
      {lines}
    </Box>
  );
}

/**
 * Vertical-rl keeps Latin letters on their side; the default `mixed`
 * orientation leaves © upright (Unicode VO=U), so the 180° flip that puts
 * the credit on the bottom edge stands the symbol on its head. `sideways`
 * rotates © with the rest of the string.
 */
const INLINE_CREDIT_STYLES = {
  display: "block",
  position: "absolute",
  right: 2,
  bottom: 2,
  px: 1,
  py: 2,
  fontFamily: "sans",
  fontSize: "sm",
  opacity: 0.7,
  writingMode: "vertical-rl",
  textOrientation: "sideways",
  transform: "rotate(180deg)",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  zIndex: "docked",
  pointerEvents: "none",
} as const;
