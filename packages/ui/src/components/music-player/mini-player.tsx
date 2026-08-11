"use client";

import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { Link } from "../link/link";
import { Tooltip } from "../tooltip/tooltip";
import { formatTime, truncate } from "./lib";

export interface MiniPlayerProps {
  title?: string;
  artist?: string;
  artwork?: string;
  /** Page the running track sits on; makes the record a link back to it. */
  href?: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onToggle: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onStop: () => void;
  css?: SystemStyleObject;
}

/**
 * The page-wide player squeezed into a line of header copy: a record that spins
 * while audio runs, plus the four transport controls. Presentational and
 * fully controlled — `MiniPlayerSlot` is what wires it to the engine.
 */
export function MiniPlayer({
  title,
  artist,
  artwork,
  href,
  isPlaying,
  currentTime,
  duration,
  hasNext,
  hasPrevious,
  onToggle,
  onNext,
  onPrevious,
  onStop,
  css: cssProp,
}: MiniPlayerProps) {
  const label = [title, artist].filter(Boolean).join(" — ") || "audio";
  const tooltipLabel = truncate(label, MAX_TOOLTIP_LABEL_LENGTH);

  const record = (
    <Box
      as="span"
      aria-hidden="true"
      tabIndex={-1}
      css={{
        ...RECORD_STYLES,
        // Written out rather than pulled from a helper: Panda extracts styles
        // statically and cannot follow a function call. The record only turns
        // from the breakpoint the desktop nav takes over at — on the phone it
        // sits still next to the copy.
        animationName: { base: "none", lg: "spin" },
        animationDuration: "3s",
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationPlayState: isPlaying ? "running" : "paused",
        _motionReduce: { animation: "none" },
      }}
    >
      {artwork && <Box as="img" src={artwork} alt="" css={ARTWORK_STYLES} />}
      <Box as="span" css={artwork ? GLYPH_BEHIND_ARTWORK_STYLES : GLYPH_STYLES}>
        ◉
      </Box>
    </Box>
  );

  return (
    <Box
      as="span"
      // The semantic alternatives the rule suggests are all block-level; this
      // one lives inside a line of header copy.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="group"
      aria-label={`Now playing: ${label}`}
      css={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35em",
        verticalAlign: "middle",
        my: "-2px",
        pointerEvents: "auto",
        animation: "fadeInUp 150ms ease-out",
        _motionReduce: { animation: "none" },
        ...cssProp,
      }}
    >
      <Tooltip label={tooltipLabel} placement="bottom" delay={TOOLTIP_DELAY}>
        {href ? (
          <Link href={href} aria-label={`Go to the page playing ${label}`} css={RECORD_LINK_STYLES}>
            {record}
          </Link>
        ) : (
          record
        )}
      </Tooltip>

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
        {isPlaying ? <PauseBars /> : "▸"}
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

      <Box as="span" css={CLOCK_STYLES}>
        {duration > 0 ? formatTime(currentTime) : "-:--"}
      </Box>

      <Box
        as="button"
        type="button"
        onClick={onStop}
        aria-label="Stop playback"
        css={{ ...CONTROL_STYLES, ml: "0.15em", opacity: 0.5, _hover: { opacity: 1 } }}
      >
        ✕
      </Box>
    </Box>
  );
}

/**
 * Two drawn bars rather than a glyph pair: at this size the typographic
 * candidates are either too wide or read as a stray divider.
 */
function PauseBars() {
  return (
    <Box as="span" aria-hidden="true" css={{ display: "inline-flex", gap: "2px" }}>
      <Box as="span" css={PAUSE_BAR_STYLES} />
      <Box as="span" css={PAUSE_BAR_STYLES} />
    </Box>
  );
}

const TOOLTIP_DELAY = 1000;

const MAX_TOOLTIP_LABEL_LENGTH = 40;

const RECORD_STYLES = {
  display: "inline-flex",
  flexShrink: 0,
  justifyContent: "center",
  alignItems: "center",
  w: "14px",
  h: "14px",
  color: "primary.500",
  fontSize: "2xs",
  lineHeight: "14px",
  bg: "transparent",
  borderRadius: "full",
  overflow: "hidden",
} as const;

const ARTWORK_STYLES = {
  display: { base: "none", lg: "block" },
  w: "full",
  h: "full",
  objectFit: "cover",
} as const;

const GLYPH_STYLES = {
  display: "inline",
} as const;

// The cover is desktop-only, so on the phone the glyph stands in for it.
const GLYPH_BEHIND_ARTWORK_STYLES = {
  display: { base: "inline", lg: "none" },
} as const;

const RECORD_LINK_STYLES = {
  display: "inline-flex",
  lineHeight: "0",
  pointerEvents: "auto",
  textDecoration: "none",
  _hover: { textDecoration: "none" },
} as const;

const PAUSE_BAR_STYLES = {
  display: "inline-block",
  w: "3px",
  h: "9px",
  bg: "currentColor",
} as const;

const CLOCK_STYLES = {
  display: { base: "none", lg: "inline" },
  ml: "0.15em",
  color: "primary.500",
  fontFamily: "mono",
  fontSize: "2xs",
  fontVariantNumeric: "tabular-nums",
} as const;

const CONTROL_STYLES = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  minW: "12px",
  p: "0",
  color: "primary.500",
  font: "inherit",
  lineHeight: "1",
  bg: "transparent",
  border: "none",
  cursor: "pointer",
  pointerEvents: "auto",
  _hover: { opacity: 0.7 },
  _disabled: { opacity: 0.35, cursor: "default", _hover: { opacity: 0.35 } },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
} as const;
