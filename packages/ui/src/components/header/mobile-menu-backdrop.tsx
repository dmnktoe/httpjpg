"use client";

import { Box } from "../box/box";

const PATTERN = [
  "✦",
  "·",
  "⋆",
  "·",
  "☆",
  "·",
  "◆",
  "·",
  "⋆",
  "·",
  "✦",
  "·",
  "☆",
  "·",
  "◆",
  "·",
  "⋆",
  "·",
  "✦",
  "·",
] as const;

const COLS = 14;
const ROWS = 28;

const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => PATTERN[i % PATTERN.length]);

const CELL_NODES = CELLS.map((char, i) => <span key={i}>{char}</span>);

/** Full-viewport ASCII wash behind the mobile menu. */
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
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          color: "pageFg",
          opacity: 0.2,
          fontFamily: "mono",
          fontSize: "xs",
          animation: "asciiPulse 4s ease-in-out infinite",
          overflow: "hidden",
          "& span": {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      >
        {CELL_NODES}
      </Box>
    </Box>
  );
}

MobileMenuBackdrop.displayName = "MobileMenuBackdrop";
