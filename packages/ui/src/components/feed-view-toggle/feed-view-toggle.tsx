"use client";

import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import type { FeedView } from "../feed-grid/feed-grid";

export interface FeedViewToggleProps {
  /** `auto` marks the option the viewport picks: list on a phone, grid from `md` up. */
  view: FeedView;
  onViewChange: (view: "grid" | "list") => void;
  css?: SystemStyleObject;
}

const RAISED = {
  color: "neutral.600",
  textShadow: "0 1px 0 {colors.white}",
  bg: "linear-gradient(to bottom, {colors.white} 0%, {colors.neutral.100} 50%, {colors.neutral.200} 50%, {colors.neutral.100} 100%)",
  borderColor: "neutral.400",
  boxShadow: "inset 0 1px 0 {colors.white}",
} as const;

const PRESSED = {
  color: "white",
  textShadow: "0 -1px 0 rgba(0, 0, 0, 0.4)",
  bg: "linear-gradient(to bottom, {colors.primary.500} 0%, {colors.primary.600} 50%, {colors.primary.700} 50%, {colors.primary.600} 100%)",
  borderColor: "primary.800",
  boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.35)",
} as const;

const OPTION_CLASS = css({
  all: "unset",
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  h: "1.875rem",
  px: "5",
  fontFamily: "sans",
  fontSize: "sm",
  fontWeight: "bold",
  lineHeight: 1,
  border: "1px solid",
  cursor: "pointer",
  userSelect: "none",
  ...RAISED,
  _first: { borderRadius: "0.3125rem 0 0 0.3125rem" },
  _last: { borderLeftWidth: 0, borderRadius: "0 0.3125rem 0.3125rem 0" },
  _hover: { filter: "brightness(1.04)" },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
  "&[data-state=on]": PRESSED,
  "&[data-state=narrow]": { base: PRESSED, md: RAISED },
  "&[data-state=wide]": { md: PRESSED },
});

const OPTIONS = [
  { value: "grid", label: "▦ grid", auto: "wide" },
  { value: "list", label: "☰ list", auto: "narrow" },
] as const;

export function FeedViewToggle({ view, onViewChange, css: cssProp }: FeedViewToggleProps) {
  return (
    <Box
      as="fieldset"
      aria-label="Feed layout"
      css={{
        display: "flex",
        justifyContent: "center",
        minW: 0,
        m: 0,
        px: 0,
        py: "2.5",
        border: "none",
        borderY: "1px solid {colors.neutral.300}",
        bg: "linear-gradient(to bottom, {colors.neutral.50} 0%, {colors.neutral.200} 100%)",
        boxShadow: "inset 0 1px 0 {colors.white}",
        ...cssProp,
      }}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          data-state={view === "auto" ? option.auto : view === option.value ? "on" : "off"}
          aria-pressed={view === "auto" ? undefined : view === option.value}
          className={OPTION_CLASS}
          onClick={() => onViewChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </Box>
  );
}
