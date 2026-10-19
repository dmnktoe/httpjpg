"use client";

import type { MouseEvent } from "react";
import { useEffect, useRef } from "react";

import { Box } from "../box/box";
import { CommandPaletteHighlight } from "./command-palette-highlight";
import type { CommandPaletteMediaItem } from "./command-palette-media";
import { snippetAround } from "./lib";

export interface CommandPaletteResult {
  id: string;
  title: string;
  href: string;
  kind: "work" | "page";
  excerpt?: string;
  /** Thumbnails from the page, shown in the palette's media strip. */
  media?: CommandPaletteMediaItem[];
}

interface CommandPaletteResultItemProps {
  result: CommandPaletteResult;
  isActive: boolean;
  optionId: string;
  /** Normalized query terms to mark, as `/api/search` ranked them. */
  terms: string[];
  onSelect: (result: CommandPaletteResult) => void;
  onHover: () => void;
}

export function CommandPaletteResultItem({
  result,
  isActive,
  optionId,
  terms,
  onSelect,
  onHover,
}: CommandPaletteResultItemProps) {
  const ref = useRef<HTMLLIElement>(null);

  // The list scrolls inside the dialog; arrowing past its edge must not hide the active row.
  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView?.({ block: "nearest" });
    }
  }, [isActive]);

  return (
    <Box
      as="li"
      ref={ref}
      id={optionId}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="option"
      aria-selected={isActive}
      onMouseEnter={onHover}
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
        borderLeft: "3px solid",
        borderLeftColor: isActive ? "primary.500" : "transparent",
        cursor: "pointer",
      }}
    >
      <Box
        as="span"
        css={{
          flexShrink: 0,
          w: "14",
          color: "inherit",
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
        <Box css={{ fontFamily: "sans", fontSize: "md", fontWeight: "bold" }}>
          <CommandPaletteHighlight text={result.title} terms={terms} />
        </Box>
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
            <CommandPaletteHighlight text={snippetAround(result.excerpt, terms)} terms={terms} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
