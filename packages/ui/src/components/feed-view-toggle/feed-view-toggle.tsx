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

const ACTIVE = { opacity: 1, borderTopColor: "pageFg" } as const;
const INACTIVE = { opacity: 0.4, borderTopColor: "transparent" } as const;

const OPTION_CLASS = css({
  boxSizing: "border-box",
  mt: "-1px",
  px: "4",
  py: "3",
  opacity: 0.4,
  fontFamily: "mono",
  fontSize: "sm",
  lineHeight: 1,
  borderTop: "1px solid transparent",
  transition: "opacity 0.2s",
  cursor: "pointer",
  userSelect: "none",
  all: "unset",
  "&[data-state=on]": ACTIVE,
  _hover: { opacity: 1 },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "-2px" },
  "&[data-state=narrow]": { base: ACTIVE, md: INACTIVE },
  "&[data-state=wide]": { md: ACTIVE },
});

const OPTIONS = [
  { value: "grid", label: "[ ▦ grid ]", auto: "wide" },
  { value: "list", label: "[ ☰ list ]", auto: "narrow" },
] as const;

export function FeedViewToggle({ view, onViewChange, css: cssProp }: FeedViewToggleProps) {
  return (
    <Box
      as="fieldset"
      aria-label="Feed layout"
      css={{
        display: "flex",
        justifyContent: "center",
        gap: "2",
        minW: 0,
        m: 0,
        p: 0,
        border: "none",
        borderTop: "1px solid",
        borderColor: "pageBorder",
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
