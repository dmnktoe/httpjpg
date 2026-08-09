"use client";

import { useCallback, useEffect, useState } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";

/** Dispatched on `window` to ask the command palette to open. */
export const OPEN_SEARCH_EVENT = "openSearch";

declare global {
  interface WindowEventMap {
    openSearch: CustomEvent<void>;
  }
}

export interface SearchTriggerProps {
  /** Overrides the default `window` event, mirroring Footer's cookie hook. */
  onTrigger?: () => void;
  label?: string;
  css?: SystemStyleObject;
}

export function SearchTrigger({ onTrigger, label = "search", css: cssProp }: SearchTriggerProps) {
  const [modifier, setModifier] = useState<string>();

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    setModifier(/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent) ? "⌘" : "^");
  }, []);

  const handleClick = useCallback(() => {
    if (onTrigger) {
      onTrigger();
      return;
    }
    window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
  }, [onTrigger]);

  return (
    <Box
      as="button"
      type="button"
      onClick={handleClick}
      aria-label="Open search"
      aria-keyshortcuts="Meta+K Control+K"
      css={{
        display: "flex",
        flexShrink: 0,
        alignItems: "center",
        gap: "2",
        p: "0",
        color: "pageFg",
        fontFamily: "mono",
        fontSize: "sm",
        bg: "transparent",
        border: "none",
        cursor: "pointer",
        pointerEvents: "auto",
        _hover: {
          "& [data-badge]": { color: "primary.500", bg: "accent.400" },
          "& [data-label]": { textDecorationStyle: "wavy" },
        },
        _focusVisible: {
          outline: "2px solid",
          outlineColor: "primary.500",
          outlineOffset: "3px",
        },
        ...cssProp,
      }}
    >
      <Box
        data-badge
        aria-hidden="true"
        css={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.5",
          minW: "7",
          h: "7",
          px: "1.5",
          color: "white",
          fontFamily: "mono",
          fontSize: "sm",
          fontWeight: "bold",
          lineHeight: "none",
          bg: "primary.500",
          boxShadow: "2px 2px 0 0 #A3E635",
          transition: "background 120ms ease-out, color 120ms ease-out",
        }}
      >
        {modifier ?? "⌕"}
        {modifier && <Box as="span">K</Box>}
      </Box>
      <Box
        as="span"
        data-label
        css={{
          display: { base: "none", md: "inline" },
          textDecoration: "underline",
          textDecorationColor: "primary.500",
          textDecorationThickness: "1px",
          textUnderlineOffset: "3px",
        }}
      >
        {label}
      </Box>
    </Box>
  );
}
