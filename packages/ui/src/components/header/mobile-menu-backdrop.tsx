"use client";

import { Box } from "../box/box";

const TILE = "✦ · ⋆ · ☆ · ◆ · ";
const FIELD = Array.from({ length: 28 }, (_, row) => {
  const line = TILE.repeat(14);
  return row % 2 === 0 ? line : line.slice(4);
}).join("\n");

/** Full-viewport ASCII wash behind the mobile menu. One text node, not a cell grid. */
export function MobileMenuBackdrop() {
  return (
    <Box
      aria-hidden="true"
      data-testid="mobile-menu-backdrop"
      css={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      <Box css={{ position: "absolute", inset: 0, opacity: 0.9, bg: "pageBg" }} />
      <Box
        css={{
          position: "absolute",
          inset: 0,
          p: "2",
          color: "pageFg",
          opacity: 0.2,
          fontFamily: "mono",
          fontSize: "xs",
          lineHeight: "loose",
          letterSpacing: "0.35em",
          whiteSpace: "pre",
          animation: "asciiPulse 4s ease-in-out infinite",
          overflow: "hidden",
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      >
        {FIELD}
      </Box>
    </Box>
  );
}

MobileMenuBackdrop.displayName = "MobileMenuBackdrop";
