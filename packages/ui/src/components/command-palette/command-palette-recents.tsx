"use client";

import type { MouseEvent } from "react";

import { Box } from "../box/box";

interface CommandPaletteRecentsProps {
  recents: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
}

/** Shown on an empty query: the searches that led somewhere, one tap from running again. */
export function CommandPaletteRecents({ recents, onSelect, onClear }: CommandPaletteRecentsProps) {
  if (recents.length === 0) {
    return null;
  }

  return (
    <Box css={{ py: "2", borderColor: "pageBorder", borderBottom: "1px solid" }}>
      <Box
        css={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: "4",
          py: "1",
          color: "pageMuted",
          fontFamily: "mono",
          fontSize: "sm",
          letterSpacing: "wide",
          textTransform: "uppercase",
        }}
      >
        <Box as="span">recent</Box>
        <Box
          as="button"
          type="button"
          onMouseDown={(event: MouseEvent) => event.preventDefault()}
          onClick={onClear}
          aria-label="Clear recent searches"
          css={{
            color: "inherit",
            fontFamily: "inherit",
            fontSize: "inherit",
            letterSpacing: "inherit",
            textTransform: "inherit",
            bg: "transparent",
            border: "none",
            cursor: "pointer",
            _hover: { color: "pageFg" },
            _focusVisible: { outline: "2px solid", outlineColor: "primary.500" },
          }}
        >
          clear
        </Box>
      </Box>
      <Box as="ul">
        {recents.map((recent) => (
          <Box as="li" key={recent}>
            <Box
              as="button"
              type="button"
              onMouseDown={(event: MouseEvent) => event.preventDefault()}
              onClick={() => onSelect(recent)}
              css={{
                display: "flex",
                gap: "3",
                w: "full",
                px: "4",
                py: "1.5",
                color: "pageFg",
                fontFamily: "mono",
                fontSize: "md",
                textAlign: "left",
                bg: "transparent",
                border: "none",
                cursor: "pointer",
                _hover: { color: "pageBg", bg: "pageFg" },
                _focusVisible: { outline: "2px solid", outlineColor: "primary.500" },
              }}
            >
              <Box as="span" aria-hidden="true" css={{ opacity: 0.5 }}>
                ↺
              </Box>
              {recent}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
