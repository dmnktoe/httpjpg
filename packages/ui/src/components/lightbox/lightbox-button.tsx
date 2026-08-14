"use client";

import type { ButtonHTMLAttributes } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface LightboxButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "css"> {
  "aria-label": string;
  css?: SystemStyleObject;
}

/**
 * The lightbox's control surface: a monospace glyph in brackets rather than an
 * `IconButton`, so the chrome reads in the same ASCII register as the rest of
 * the site. Disabled is never used — navigation wraps — but focus is, so the
 * ring has to stay.
 */
export function LightboxButton({ children, css: cssProp, ...props }: LightboxButtonProps) {
  return (
    <Box
      as="button"
      type="button"
      css={{
        all: "unset",
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minW: "10",
        minH: "10",
        px: "2",
        cursor: "pointer",
        fontFamily: "mono",
        fontSize: "sm",
        lineHeight: 1,
        color: "pageFg",
        whiteSpace: "nowrap",
        userSelect: "none",
        opacity: 0.7,
        transition: "opacity 0.2s, transform 0.2s",
        _hover: { opacity: 1 },
        _active: { transform: "scale(0.94)" },
        _focusVisible: {
          opacity: 1,
          outline: "2px solid",
          outlineColor: "primary.500",
          outlineOffset: "2px",
        },
        ...cssProp,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
