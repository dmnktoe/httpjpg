"use client";

import type { MouseEvent } from "react";

import { Box } from "../box/box";

interface CommandPaletteSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function CommandPaletteSuggestions({
  suggestions,
  onSelect,
}: CommandPaletteSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Box
      css={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "2",
        px: "4",
        py: "2",
        borderColor: "pageBorder",
        borderBottom: "1px solid",
      }}
    >
      <Box
        as="span"
        css={{
          color: "pageMuted",
          fontFamily: "mono",
          fontSize: "sm",
          letterSpacing: "wide",
          textTransform: "uppercase",
        }}
      >
        try
      </Box>
      {suggestions.map((suggestion) => (
        <Box
          key={suggestion}
          as="button"
          type="button"
          onMouseDown={(event: MouseEvent) => {
            event.preventDefault();
            onSelect(suggestion);
          }}
          css={{
            px: "2",
            py: "0.5",
            color: "pageFg",
            fontFamily: "mono",
            fontSize: "sm",
            bg: "transparent",
            border: "1px solid",
            borderColor: "pageBorder",
            cursor: "pointer",
            _hover: { color: "pageBg", bg: "pageFg" },
            _focusVisible: { outline: "2px solid", outlineColor: "primary.500" },
          }}
        >
          {suggestion}
        </Box>
      ))}
    </Box>
  );
}
