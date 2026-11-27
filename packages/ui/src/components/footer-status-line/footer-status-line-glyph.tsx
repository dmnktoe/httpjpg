"use client";

import type { HTMLAttributes } from "react";

import { Box } from "../box/box";

export interface FooterStatusLineGlyphProps extends HTMLAttributes<HTMLSpanElement> {
  glyph: string;
}

/** Stands in for `FooterStatusLineThumb` when there is no image, at the same size. */
export function FooterStatusLineGlyph({ glyph, ...props }: FooterStatusLineGlyphProps) {
  return (
    <Box
      as="span"
      aria-hidden="true"
      {...props}
      css={{
        display: "inline-grid",
        flexShrink: 0,
        placeItems: "center",
        width: "3",
        height: "3",
        color: "neutral.600",
        fontSize: "0.5625rem",
        lineHeight: "none",
        verticalAlign: "middle",
        bg: "neutral.200",
        borderRadius: "sm",
      }}
    >
      {glyph}
    </Box>
  );
}
