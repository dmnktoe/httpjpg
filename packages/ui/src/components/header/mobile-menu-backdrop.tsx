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
const CELL_COUNT = COLS * ROWS;

export const MobileMenuBackdrop = () => (
  <Box
    aria-hidden="true"
    css={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      overflow: "hidden",
      userSelect: "none",
      display: "grid",
      gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      gridAutoRows: "1fr",
      color: "pageFg",
      fontFamily: "mono",
      fontSize: "xs",
    }}
  >
    {Array.from({ length: CELL_COUNT }, (_, i) => (
      <Box
        key={i}
        as="span"
        style={{ animationDelay: `${(((i * 41) % 100) / 100) * 4}s` }}
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.08,
          animation: "asciiPulse 4s ease-in-out infinite",
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        }}
      >
        {PATTERN[i % PATTERN.length]}
      </Box>
    ))}
  </Box>
);

MobileMenuBackdrop.displayName = "MobileMenuBackdrop";
