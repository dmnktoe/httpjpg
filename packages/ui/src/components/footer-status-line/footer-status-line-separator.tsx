"use client";

import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface FooterStatusLineSeparatorProps {
  css?: SystemStyleObject;
}

/** The `·` between a status line's fields. Decorative, so it stays out of the accessibility tree. */
export function FooterStatusLineSeparator({ css: cssProp }: FooterStatusLineSeparatorProps) {
  return (
    <Box
      as="span"
      aria-hidden="true"
      css={{ flexShrink: 0, opacity: 40, userSelect: "none", ...cssProp }}
    >
      ·
    </Box>
  );
}
