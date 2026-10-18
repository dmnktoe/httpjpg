"use client";

import type { ReactNode } from "react";

import { Box } from "../box/box";
import { highlightRanges } from "./lib";

interface CommandPaletteHighlightProps {
  text: string;
  terms: string[];
}

/** Marks the matched terms, highlighter-style; lime on black reads on both row states. */
export function CommandPaletteHighlight({ text, terms }: CommandPaletteHighlightProps) {
  const ranges = highlightRanges(text, terms);
  if (ranges.length === 0) {
    return text;
  }

  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) {
      parts.push(text.slice(cursor, range.start));
    }
    parts.push(
      <Box
        as="mark"
        key={range.start}
        css={{ mx: "-0.5", px: "0.5", color: "black", bg: "accent.300" }}
      >
        {text.slice(range.start, range.end)}
      </Box>,
    );
    cursor = range.end;
  }
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }
  return parts;
}
