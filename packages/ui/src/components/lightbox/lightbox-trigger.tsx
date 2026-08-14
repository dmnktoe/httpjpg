"use client";

import type { ButtonHTMLAttributes } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface LightboxTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "css"> {
  /**
   * `cover` stretches an invisible hit area over the whole parent — right for a
   * still, wrong for anything with its own controls to press. `corner` is a
   * small visible chip instead. @default "cover"
   */
  variant?: "cover" | "corner";
  /** Defaults to a generic label; pass the image's alt text where there is one. */
  label?: string;
  css?: SystemStyleObject;
}

// Spread into each variant rather than set on the base: a variant's own
// `_focusVisible` replaces the key wholesale, so a shared one would be dropped.
const FOCUS_RING: SystemStyleObject = {
  outline: "2px solid",
  outlineColor: "primary.500",
};

const VARIANT_STYLES: Record<NonNullable<LightboxTriggerProps["variant"]>, SystemStyleObject> = {
  cover: {
    inset: 0,
    cursor: "zoom-in",
    // Inset, because a cover trigger's edge is the image's edge.
    _focusVisible: { ...FOCUS_RING, outlineOffset: "-2px" },
  },
  corner: {
    top: "2",
    right: "2",
    px: "2",
    py: "1",
    color: "white",
    bg: "rgba(0, 0, 0, 0.55)",
    cursor: "pointer",
    fontFamily: "mono",
    fontSize: "xs",
    lineHeight: 1,
    opacity: 0.75,
    transition: "opacity 0.2s",
    _hover: { opacity: 1 },
    _focusVisible: { ...FOCUS_RING, opacity: 1, outlineOffset: "2px" },
  },
};

/**
 * Opens a `Lightbox` from the thing it enlarges.
 *
 * The `cover` variant is a sibling of the image rather than a wrapper around
 * it: `<button>` takes phrasing content, and the things worth making zoomable —
 * an image plus its ASCII overlay and credit — are not that. Overlaying keeps
 * the markup valid and leaves the parent's layout alone.
 */
export function LightboxTrigger({
  variant = "cover",
  label = "Open at full size",
  children,
  css: cssProp,
  ...props
}: LightboxTriggerProps) {
  return (
    <Box
      as="button"
      type="button"
      aria-label={label}
      css={{
        all: "unset",
        boxSizing: "border-box",
        position: "absolute",
        zIndex: "docked",
        display: "block",
        userSelect: "none",
        ...VARIANT_STYLES[variant],
        ...cssProp,
      }}
      {...props}
    >
      {variant === "corner" ? (children ?? "[ ⤢ ]") : children}
    </Box>
  );
}
