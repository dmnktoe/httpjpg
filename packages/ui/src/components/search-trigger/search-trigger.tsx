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
  const [shortcut, setShortcut] = useState<string>();

  // Rendered after mount and only where a keyboard exists: advertising ⌘K to a
  // phone is a lie, and picking the glyph on the server would hydrate wrong.
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    setShortcut(/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent) ? "⌘K" : "^K");
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
        minH: "12",
        px: "3",
        color: "pageFg",
        fontFamily: "mono",
        fontSize: "sm",
        bg: "transparent",
        border: "1px solid",
        borderColor: "pageBorder",
        cursor: "pointer",
        pointerEvents: "auto",
        _hover: { color: "pageBg", bg: "pageFg" },
        _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
        ...cssProp,
      }}
    >
      <Box as="span" aria-hidden="true" css={{ opacity: 0.6 }}>
        &gt;
      </Box>
      {label}
      {shortcut && (
        <Box as="kbd" aria-hidden="true" css={{ opacity: 0.5, fontFamily: "mono" }}>
          {shortcut}
        </Box>
      )}
    </Box>
  );
}
