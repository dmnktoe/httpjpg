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
  /** Shown where there is no keyboard to press. */
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
        display: "inline",
        p: "0",
        color: "primary.500",
        font: "inherit",
        bg: "transparent",
        border: "none",
        cursor: "pointer",
        pointerEvents: "auto",
        textDecoration: "underline",
        textDecorationThickness: "1px",
        textUnderlineOffset: "2px",
        _hover: { textDecorationStyle: "wavy" },
        _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
        ...cssProp,
      }}
    >
      <Box as="span" aria-hidden="true">
        •&nbsp;
      </Box>
      {modifier ? `${modifier}+𝙆` : label}
    </Box>
  );
}
