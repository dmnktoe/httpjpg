"use client";

import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

export interface MiniPlayerProps {
  title?: string;
  artist?: string;
  artwork?: string;
  isPlaying: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  onToggle: () => void;
  onNext: () => void;
  onPrevious: () => void;
  css?: SystemStyleObject;
}

/**
 * The page-wide player squeezed into a line of header copy: a 16px record that
 * spins while audio runs, plus the four transport controls. Presentational and
 * fully controlled — `MiniPlayerSlot` is what wires it to the engine.
 */
export function MiniPlayer({
  title,
  artist,
  artwork,
  isPlaying,
  hasNext,
  hasPrevious,
  onToggle,
  onNext,
  onPrevious,
  css: cssProp,
}: MiniPlayerProps) {
  const label = [title, artist].filter(Boolean).join(" — ") || "audio";

  return (
    <Box
      as="span"
      // The semantic alternatives the rule suggests are all block-level; this
      // one lives inside a line of header copy.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="group"
      aria-label={`Now playing: ${label}`}
      title={label}
      css={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35em",
        verticalAlign: "middle",
        pointerEvents: "auto",
        animation: "fadeInUp 150ms ease-out",
        _motionReduce: { animation: "none" },
        ...cssProp,
      }}
    >
      <Box
        as="span"
        aria-hidden="true"
        css={{
          ...RECORD_STYLES,
          // Written out rather than pulled from a helper: Panda extracts styles
          // statically and cannot follow a function call.
          animation: "spin 3s linear infinite",
          animationPlayState: isPlaying ? "running" : "paused",
          _motionReduce: { animation: "none" },
        }}
      >
        {artwork ? (
          <img src={artwork} alt="" className={css({ w: "full", h: "full", objectFit: "cover" })} />
        ) : (
          "◉"
        )}
      </Box>

      <Box
        as="button"
        type="button"
        onClick={onPrevious}
        disabled={!hasPrevious}
        aria-label="Previous track"
        css={CONTROL_STYLES}
      >
        ⏮
      </Box>
      <Box
        as="button"
        type="button"
        onClick={onToggle}
        aria-label={isPlaying ? "Pause" : "Play"}
        css={CONTROL_STYLES}
      >
        {isPlaying ? "▮▮" : "▸"}
      </Box>
      <Box
        as="button"
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Next track"
        css={CONTROL_STYLES}
      >
        ⏭
      </Box>
    </Box>
  );
}

const RECORD_STYLES = {
  display: "inline-flex",
  flexShrink: 0,
  justifyContent: "center",
  alignItems: "center",
  w: "16px",
  h: "16px",
  color: "primary.500",
  fontSize: "2xs",
  lineHeight: "16px",
  bg: "transparent",
  borderRadius: "full",
  overflow: "hidden",
} as const;

const CONTROL_STYLES = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  minW: "12px",
  p: "0",
  color: "primary.500",
  font: "inherit",
  // Keeps the two bars of the pause glyph from fusing into one block.
  letterSpacing: "wider",
  lineHeight: "1",
  bg: "transparent",
  border: "none",
  cursor: "pointer",
  pointerEvents: "auto",
  _hover: { opacity: 0.7 },
  _disabled: { opacity: 0.35, cursor: "default", _hover: { opacity: 0.35 } },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
} as const;
