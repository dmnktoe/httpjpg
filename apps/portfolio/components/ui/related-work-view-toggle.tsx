"use client";

import { Box } from "@httpjpg/ui";
import { css } from "styled-system/css";

/** Declaration order is render order. */
export const RELATED_WORK_VIEWS = ["list", "grid"] as const;

export type RelatedWorkView = (typeof RELATED_WORK_VIEWS)[number];

export interface RelatedWorkViewToggleProps {
  view: RelatedWorkView;
  onChange: (view: RelatedWorkView) => void;
}

const GLYPHS: Record<RelatedWorkView, string> = { grid: "[#]", list: "[=]" };

const buttonClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  px: "0",
  py: "1",
  color: "inherit",
  opacity: 0.4,
  fontFamily: "mono",
  fontSize: "xs",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  bg: "transparent",
  border: "none",
  transitionProperty: "opacity",
  transitionDuration: "fast",
  cursor: "pointer",
  _hover: { opacity: 0.7 },
  '&[aria-pressed="true"]': { opacity: 1, cursor: "default" },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
});

const glyphClass = css({ userSelect: "none" });

/** Names the group for assistive tech; the glyphs alone would not. */
const legendClass = css({
  position: "absolute",
  w: "1px",
  h: "1px",
  m: "-1px",
  p: 0,
  whiteSpace: "nowrap",
  overflow: "hidden",
  clipPath: "inset(50%)",
});

export function RelatedWorkViewToggle({ view, onChange }: RelatedWorkViewToggleProps) {
  return (
    <Box as="fieldset" css={{ display: "flex", gap: "4", m: 0, p: 0, border: "none" }}>
      <Box as="legend" className={legendClass}>
        Related work layout
      </Box>
      {RELATED_WORK_VIEWS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={view === option}
          onClick={() => onChange(option)}
          className={buttonClass}
        >
          <span aria-hidden="true" className={glyphClass}>
            {GLYPHS[option]}
          </span>
          {option}
        </button>
      ))}
    </Box>
  );
}
