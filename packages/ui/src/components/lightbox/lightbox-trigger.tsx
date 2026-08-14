"use client";

import type { ButtonHTMLAttributes } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface LightboxTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "css"> {
  variant?: "cover" | "corner";
  label?: string;
  css?: SystemStyleObject;
}

const FOCUS_RING: SystemStyleObject = {
  outline: "2px solid",
  outlineColor: "primary.500",
};

const VARIANT_STYLES: Record<NonNullable<LightboxTriggerProps["variant"]>, SystemStyleObject> = {
  cover: {
    inset: 0,
    cursor: "zoom-in",
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
