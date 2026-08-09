"use client";

import { useCallback, useEffect, useState } from "react";
import { token } from "styled-system/tokens";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { ShimmeringText } from "../shimmering-text/shimmering-text";

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
  // Undefined means "not resolved yet", and renders nothing at all. The label
  // and the shortcut are two different final states, so showing either one
  // before the platform is known would swap the text under the reader's eyes.
  const [caption, setCaption] = useState<string>();

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setCaption(label);
      return;
    }
    const modifier = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent) ? "⌘" : "^";
    setCaption(`${modifier}+𝙆`);
  }, [label]);

  const handleClick = useCallback(() => {
    if (onTrigger) {
      onTrigger();
      return;
    }
    window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
  }, [onTrigger]);

  if (!caption) {
    return null;
  }

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
        // Undecorated until hovered, like the nav links either side of it. The
        // bullet separator stays outside the button, so it keeps the body text
        // colour and the hover underline does not run through it.
        textDecoration: "none",
        animation: "fadeInUp 150ms ease-out",
        _motionReduce: { animation: "none" },
        _hover: { textDecoration: "underline" },
        _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
        ...cssProp,
      }}
    >
      <ShimmeringText
        text={caption}
        repeat={false}
        startOnView={false}
        duration={1.2}
        delay={0.15}
        color={token.var("colors.primary.500")}
        shimmerColor={token.var("colors.primary.200")}
      />
    </Box>
  );
}
