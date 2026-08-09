"use client";

import type { MouseEvent } from "react";

import { Box } from "../box/box";
import type { CommandPaletteResult } from "./command-palette-result";

/** A thumbnail one of the results shows on its page. */
export interface CommandPaletteMediaItem {
  id: string;
  kind: "image" | "video" | "audio";
  /** Thumbnail URL. Empty tiles fall back to the glyph for their kind. */
  thumb: string;
  label: string;
}

/** Wide enough to scan at a glance, small enough to keep the list in view. */
const TILE_SIZE = "14";

const KIND_GLYPH = { image: "▣", video: "▶", audio: "♪" } as const;

interface CommandPaletteMediaProps {
  results: CommandPaletteResult[];
  /** Caps the strip so one image-heavy page cannot crowd out the rest. */
  limit?: number;
  onSelect: (result: CommandPaletteResult) => void;
}

export function CommandPaletteMedia({ results, limit = 8, onSelect }: CommandPaletteMediaProps) {
  const items = flattenMedia(results, limit);

  if (items.length === 0) {
    return null;
  }

  return (
    <Box
      css={{
        display: "flex",
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
          flexShrink: 0,
          color: "pageMuted",
          fontFamily: "mono",
          fontSize: "sm",
          letterSpacing: "wide",
          textTransform: "uppercase",
        }}
      >
        media
      </Box>
      <Box
        css={{
          display: "flex",
          gap: "2",
          // The strip scrolls sideways rather than wrapping: the palette's
          // height belongs to the results, not to the thumbnails.
          overflowX: "auto",
          scrollbarWidth: "none",
          _scrollbar: { display: "none" },
        }}
      >
        {items.map(({ media, result }) => (
          <MediaTile
            key={`${result.id}-${media.id}`}
            media={media}
            result={result}
            onSelect={onSelect}
          />
        ))}
      </Box>
    </Box>
  );
}

interface MediaTileProps {
  media: CommandPaletteMediaItem;
  result: CommandPaletteResult;
  onSelect: (result: CommandPaletteResult) => void;
}

function MediaTile({ media, result, onSelect }: MediaTileProps) {
  const label = media.label ? `${media.label} — ${result.title}` : result.title;

  return (
    <Box
      as="button"
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event: MouseEvent) => event.preventDefault()}
      onClick={() => onSelect(result)}
      css={{
        position: "relative",
        flexShrink: 0,
        w: TILE_SIZE,
        h: TILE_SIZE,
        p: "0",
        color: "pageFg",
        bg: "transparent",
        border: "1px solid",
        borderColor: "pageBorder",
        cursor: "pointer",
        _hover: { borderColor: "primary.500" },
        _focusVisible: { outline: "2px solid", outlineColor: "primary.500" },
      }}
    >
      {media.thumb ? (
        <Box
          as="img"
          src={media.thumb}
          alt=""
          loading="lazy"
          decoding="async"
          css={{ w: "full", h: "full", objectFit: "cover" }}
        />
      ) : (
        <Box
          as="span"
          css={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            w: "full",
            h: "full",
            fontFamily: "mono",
            fontSize: "md",
          }}
        >
          {KIND_GLYPH[media.kind]}
        </Box>
      )}
      {media.kind !== "image" && media.thumb && (
        <Box
          as="span"
          aria-hidden="true"
          css={{
            position: "absolute",
            right: "0",
            bottom: "0",
            px: "1",
            color: "pageBg",
            fontFamily: "mono",
            fontSize: "xs",
            lineHeight: "1.4",
            bg: "pageFg",
          }}
        >
          {KIND_GLYPH[media.kind]}
        </Box>
      )}
    </Box>
  );
}

interface FlatMedia {
  media: CommandPaletteMediaItem;
  result: CommandPaletteResult;
}

/**
 * Interleave one thumbnail per result before taking a second from any of them,
 * so a page carrying a dozen images cannot fill the strip on its own.
 */
function flattenMedia(results: CommandPaletteResult[], limit: number): FlatMedia[] {
  const flattened: FlatMedia[] = [];
  const depth = Math.max(...results.map((result) => result.media?.length ?? 0), 0);

  for (let index = 0; index < depth && flattened.length < limit; index += 1) {
    for (const result of results) {
      const media = result.media?.[index];
      if (media) {
        flattened.push({ media, result });
        if (flattened.length >= limit) {
          break;
        }
      }
    }
  }

  return flattened;
}
