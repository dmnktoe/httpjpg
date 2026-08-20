"use client";

import { Box } from "../box/box";

/** The `·` between a status line's fields. Decorative, so it stays out of the accessibility tree. */
export function FooterStatusLineSeparator() {
  return (
    <Box as="span" aria-hidden="true" css={{ flexShrink: 0, opacity: 0.4, userSelect: "none" }}>
      ·
    </Box>
  );
}
