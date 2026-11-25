"use client";

import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { Link } from "../link/link";

export interface FeedPanelItem {
  id: string;
  src: string;
  srcSet?: string;
  alt: string;
  /** `contain` shows the whole image with bars in the page colour. @default "cover" */
  fit?: "cover" | "contain";
}

export interface FeedPanelProps {
  /** Newest first; the panel cycles through them. */
  items: FeedPanelItem[];
  /** Where a click leads: the feed. */
  href: string;
  /** @default "feed" */
  label?: string;
  /** Milliseconds each post stays. @default 4000 */
  interval?: number;
  /** `sizes` hint for the images. */
  sizes?: string;
  css?: SystemStyleObject;
}

const FIT_CLASS = {
  cover: css({ display: "block", w: "full", h: "full", objectFit: "cover" }),
  contain: css({ display: "block", w: "full", h: "full", objectFit: "contain" }),
} as const;

const CHIP_STYLES: SystemStyleObject = {
  position: "absolute",
  px: "2",
  py: "1",
  color: "white",
  fontFamily: "mono",
  fontSize: "sm",
  lineHeight: 1,
  bg: "rgba(0, 0, 0, 0.55)",
  pointerEvents: "none",
  userSelect: "none",
};

export function FeedPanel({
  items,
  href,
  label = "feed",
  interval = 4000,
  sizes = "(min-width: 768px) 224px, 100vw",
  css: cssProp,
}: FeedPanelProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = items.length;
  const active = total ? index % total : 0;

  useEffect(() => {
    if (total < 2 || paused || prefersReducedMotion()) {
      return;
    }
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % total), interval);
    return () => window.clearInterval(timer);
  }, [total, paused, interval]);

  if (!total) {
    return null;
  }

  return (
    <Link
      href={href}
      aria-label={`Open the ${label}`}
      draggable={false}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      css={{
        position: "relative",
        display: "block",
        w: "full",
        aspectRatio: "1",
        overflow: "hidden",
        textDecoration: "none",
        bg: "pageBg",
        border: "1px solid",
        borderColor: "pageBorder",
        ...cssProp,
      }}
    >
      <Box
        data-feed-panel-track=""
        css={{ display: "flex", h: "full", transition: "transform 0.6s ease-in-out" }}
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {items.map((item) => (
          <Box key={item.id} css={{ flex: "0 0 100%", h: "full" }}>
            <img
              src={item.src}
              srcSet={item.srcSet || undefined}
              sizes={item.srcSet ? sizes : undefined}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              draggable={false}
              className={FIT_CLASS[item.fit === "contain" ? "contain" : "cover"]}
            />
          </Box>
        ))}
      </Box>
      <Box as="span" aria-hidden="true" css={{ ...CHIP_STYLES, top: "2", left: "2" }}>
        {`⋆ ${label}`}
      </Box>
      {total > 1 && (
        <Box as="span" aria-hidden="true" css={{ ...CHIP_STYLES, right: "2", bottom: "2" }}>
          {`[ ${pad(active + 1)} / ${pad(total)} ]`}
        </Box>
      )}
    </Link>
  );
}

function prefersReducedMotion(): boolean {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
