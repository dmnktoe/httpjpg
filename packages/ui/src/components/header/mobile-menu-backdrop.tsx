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

export function MobileMenuBackdrop() {
  return (
    <Box
      aria-hidden="true"
      css={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <Box
        css={{
          position: "absolute",
          inset: 0,
          bg: "pageBg",
          opacity: 0.9,
        }}
      />
      <Box
        css={{
          position: "absolute",
          inset: 0,
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
              opacity: 0.2,
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
    </Box>
  );
}
