"use client";

import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { Link } from "../link/link";

export interface FeedPanelImage {
  id: string;
  src: string;
  srcSet?: string;
  alt: string;
  /** `contain` shows the whole image with bars in the page colour. @default "cover" */
  fit?: "cover" | "contain";
}

export interface FeedPanelItem {
  id: string;
  /** Every image of the post; the panel slides through them before it moves on. */
  images: FeedPanelImage[];
  /** One line under the frame. */
  caption?: string;
}

export interface FeedPanelProps {
  /** Newest first; the panel cycles through them. */
  items: FeedPanelItem[];
  /** Where a click leads: the feed. */
  href: string;
  /** @default "feed" */
  label?: string;
  /** Milliseconds each image stays. @default 4000 */
  interval?: number;
  /** `sizes` hint for the images. */
  sizes?: string;
  css?: SystemStyleObject;
}

interface PanelPosition {
  post: number;
  image: number;
}

interface PanelState extends PanelPosition {
  previous: PanelPosition | null;
}

const TRANSITION_MS = 600;

const FIT_CLASS = {
  cover: css({ display: "block", w: "full", h: "full", objectFit: "cover" }),
  contain: css({ display: "block", w: "full", h: "full", objectFit: "contain" }),
} as const;

const SLIDING_CLASS = css({ transition: "transform 0.6s ease-in-out" });

export function FeedPanel({
  items,
  href,
  label = "feed",
  interval = 4000,
  sizes = "(min-width: 768px) 224px, 100vw",
  css: cssProp,
}: FeedPanelProps) {
  const [state, setState] = useState<PanelState>({ post: 0, image: 0, previous: null });
  const [paused, setPaused] = useState(false);
  const total = items.length;
  const post = total ? state.post % total : 0;
  const imageCount = items[post]?.images.length ?? 0;
  const image = imageCount ? Math.min(state.image, imageCount - 1) : 0;
  const previous = state.previous && state.previous.post < total ? state.previous : null;
  const hasSteps = total > 1 || imageCount > 1;

  useEffect(() => {
    if (!hasSteps || paused || prefersReducedMotion()) {
      return;
    }
    const timer = window.setInterval(
      () => setState((current) => nextState(current, items)),
      interval,
    );
    return () => window.clearInterval(timer);
  }, [hasSteps, paused, interval, items]);

  useEffect(() => {
    if (!state.previous) {
      return;
    }
    const timer = window.setTimeout(
      () => setState((current) => ({ ...current, previous: null })),
      TRANSITION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [state.previous]);

  if (!total) {
    return null;
  }

  const caption = items[post]?.caption;

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
        display: "flex",
        flexDirection: "column",
        w: "full",
        color: "pageFg",
        fontFamily: "mono",
        fontSize: "xs",
        lineHeight: "none",
        textDecoration: "none",
        bg: "pageBg",
        border: "1px solid",
        borderColor: "pageFg",
        boxShadow: "0.25rem 0.25rem 0 {colors.pageFg}",
        ...cssProp,
      }}
    >
      <Box
        as="span"
        aria-hidden="true"
        data-feed-panel-bar=""
        css={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "2",
          h: "7",
          px: "2",
          color: "pageBg",
          letterSpacing: "wider",
          bg: "pageFg",
          userSelect: "none",
        }}
      >
        <span>{`⋆ ${label}`}</span>
        {total > 1 && <span>{`${pad(post + 1)} / ${pad(total)}`}</span>}
      </Box>
      <Box
        as="span"
        data-feed-panel-stage=""
        css={{
          position: "relative",
          display: "block",
          aspectRatio: "1",
          w: "full",
          overflow: "hidden",
        }}
      >
        {items.map((item, itemIndex) => {
          const isActive = itemIndex === post;
          const isLeaving = previous?.post === itemIndex && !isActive;
          const shown = isActive ? image : isLeaving ? (previous?.image ?? 0) : 0;
          return (
            <Box
              as="span"
              key={item.id}
              data-feed-panel-post=""
              data-active={isActive || undefined}
              className={isActive || isLeaving ? SLIDING_CLASS : undefined}
              css={{ position: "absolute", inset: "0", display: "block" }}
              style={{
                transform: `translateY(${isActive ? 0 : isLeaving ? -100 : 100}%)`,
              }}
            >
              <Box
                as="span"
                data-feed-panel-track=""
                className={isActive ? SLIDING_CLASS : undefined}
                css={{ display: "flex", h: "full" }}
                style={{ transform: `translateX(-${shown * 100}%)` }}
              >
                {item.images.map((entry) => (
                  <Box as="span" key={entry.id} css={{ flex: "0 0 100%", h: "full" }}>
                    <img
                      src={entry.src}
                      srcSet={entry.srcSet || undefined}
                      sizes={entry.srcSet ? sizes : undefined}
                      alt={entry.alt}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className={FIT_CLASS[entry.fit === "contain" ? "contain" : "cover"]}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
        {imageCount > 1 && (
          <Box
            as="span"
            aria-hidden="true"
            data-feed-panel-dots=""
            css={{
              position: "absolute",
              right: "0",
              bottom: "0",
              left: "0",
              display: "flex",
              justifyContent: "center",
              gap: "1",
              pt: "4",
              pb: "2",
              bg: "linear-gradient(to top, rgba(0, 0, 0, 0.45), transparent)",
              pointerEvents: "none",
            }}
          >
            {items[post]?.images.map((entry, entryIndex) => (
              <Box
                as="span"
                key={entry.id}
                data-active={entryIndex === image || undefined}
                css={{
                  w: "0.375rem",
                  h: "0.375rem",
                  opacity: 0.45,
                  bg: "white",
                  borderRadius: "full",
                  transition: "opacity 0.2s",
                  "&[data-active]": { opacity: 1 },
                }}
              />
            ))}
          </Box>
        )}
      </Box>
      {caption && (
        <Box
          as="span"
          data-feed-panel-caption=""
          css={{
            display: "block",
            px: "2",
            py: "2",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            borderTop: "1px solid",
            borderTopColor: "pageFg",
            overflow: "hidden",
          }}
        >
          {caption}
        </Box>
      )}
    </Link>
  );
}

function nextState(current: PanelState, items: FeedPanelItem[]): PanelState {
  const total = items.length;
  if (!total) {
    return { post: 0, image: 0, previous: null };
  }
  const post = current.post % total;
  const imageCount = items[post]?.images.length ?? 0;
  const image = Math.min(current.image, Math.max(imageCount - 1, 0));
  if (image + 1 < imageCount) {
    return { post, image: image + 1, previous: null };
  }
  if (total === 1) {
    return { post, image: 0, previous: null };
  }
  return { post: (post + 1) % total, image: 0, previous: { post, image } };
}

function prefersReducedMotion(): boolean {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
