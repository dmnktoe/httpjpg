"use client";

import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface AsciiArtProps {
  /** Raw multi-line ASCII string. Whitespace is preserved. */
  children: string;
  /** Plain-text label for screen readers; the art itself is aria-hidden. */
  label?: string;
  /** Render inline instead of as a centered block. */
  inline?: boolean;
  css?: SystemStyleObject;
  className?: string;
}

export const AsciiArt = forwardRef<HTMLPreElement, AsciiArtProps>(function AsciiArt(
  { children, label, inline, css: cssProp, className, ...props },
  ref,
) {
  return (
    <Box
      ref={ref}
      as="pre"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
      css={{
        margin: 0,
        padding: 0,
        fontFamily: "mono",
        whiteSpace: "pre",
        userSelect: "none",
        lineHeight: 1.15,
        display: inline ? "inline-block" : "block",
        textAlign: inline ? "left" : "center",
        ...cssProp,
      }}
      {...props}
    >
      {children}
    </Box>
  );
});
