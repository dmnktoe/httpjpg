"use client";

import type { MouseEvent } from "react";

import { Box } from "../box/box";
import { Tag } from "../tag/tag";
import type { CommandPaletteMediaItem } from "./command-palette-media";

export interface CommandPaletteResult {
  id: string;
  title: string;
  href: string;
  kind: "work" | "page";
  excerpt?: string;
  /** Thumbnails from the page, shown in the palette's media strip. */
  media?: CommandPaletteMediaItem[];
  /** Marks a result that only exists in draft. */
  isDraft?: boolean;
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
        <Box css={{ display: "flex", alignItems: "center", gap: "2" }}>
          <Box as="span" css={{ fontFamily: "sans", fontSize: "md", fontWeight: "bold" }}>
            {result.title}
          </Box>
          {result.isDraft && (
            <Tag showMarker={false} css={{ flexShrink: 0, px: "2", color: "inherit" }}>
              draft
            </Tag>
          )}
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
            {result.excerpt}
          </Box>
        )}
      </Box>
    </Box>
  );
}
