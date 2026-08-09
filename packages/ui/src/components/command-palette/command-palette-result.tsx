"use client";

import type { MouseEvent } from "react";

import { Box } from "../box/box";

export interface CommandPaletteResult {
  id: string;
  title: string;
  href: string;
  kind: "work" | "page";
  excerpt?: string;
}

interface CommandPaletteResultItemProps {
  result: CommandPaletteResult;
  isActive: boolean;
  optionId: string;
  onSelect: (result: CommandPaletteResult) => void;
  onHover: () => void;
}

export function CommandPaletteResultItem({
  result,
  isActive,
  optionId,
  onSelect,
  onHover,
}: CommandPaletteResultItemProps) {
  return (
    <Box
      as="li"
      id={optionId}
      // A native <option> only lives inside <select>, which cannot hold this
      // markup — the ARIA listbox pattern is the accessible route here.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="option"
      aria-selected={isActive}
      onMouseEnter={onHover}
      // Keyboard activation is owned by the input's Enter handler, so this only
      // needs to answer the pointer. `onMouseDown` beats the input's blur.
      onMouseDown={(event: MouseEvent) => {
        event.preventDefault();
        onSelect(result);
      }}
      css={{
        display: "flex",
        alignItems: "baseline",
        gap: "3",
        px: "4",
        py: "2",
        color: isActive ? "pageBg" : "pageFg",
        bg: isActive ? "pageFg" : "transparent",
        cursor: "pointer",
      }}
    >
      <Box
        as="span"
        css={{
          flexShrink: 0,
          w: "14",
          opacity: 0.5,
          fontFamily: "mono",
          fontSize: "sm",
          letterSpacing: "wide",
          textTransform: "uppercase",
        }}
      >
        {result.kind}
      </Box>
      <Box css={{ minW: 0 }}>
        <Box css={{ fontFamily: "sans", fontSize: "md", fontWeight: "bold" }}>{result.title}</Box>
        {result.excerpt && (
          <Box
            css={{
              opacity: 0.6,
              fontFamily: "mono",
              fontSize: "sm",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {result.excerpt}
          </Box>
        )}
      </Box>
    </Box>
  );
}
