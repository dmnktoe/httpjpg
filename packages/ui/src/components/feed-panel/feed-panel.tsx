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

const WINDOW_FONT =
  '"Lucida Grande", "Lucida Sans Unicode", "Helvetica Neue", Helvetica, Arial, sans-serif';

const TRAFFIC_LIGHTS = [
  {
    glyph: "×",
    background:
      "radial-gradient(circle at 50% 22%, #fde1dc 0%, #f58a80 28%, #e0443e 62%, #a52a24 100%)",
  },
  {
    glyph: "−",
    background:
      "radial-gradient(circle at 50% 22%, #fff3cc 0%, #f8cf6a 28%, #dea123 62%, #a3731a 100%)",
  },
  {
    glyph: "+",
    background:
      "radial-gradient(circle at 50% 22%, #dcf7d6 0%, #84d97c 28%, #1aab29 62%, #127a1f 100%)",
  },
] as const;

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
        overflow: "hidden",
        color: "#1a1a1a",
        fontFamily: WINDOW_FONT,
        fontSize: "0.6875rem",
        lineHeight: "none",
        textDecoration: "none",
        bg: "#ffffff",
        border: "1px solid rgba(0, 0, 0, 0.45)",
        borderRadius: "0.3125rem 0.3125rem 0.1875rem 0.1875rem",
        boxShadow: "0 1rem 2.75rem rgba(0, 0, 0, 0.5), 0 0.125rem 0.375rem rgba(0, 0, 0, 0.25)",
        "&:hover [data-window-glyph], &:focus-visible [data-window-glyph]": { opacity: 1 },
        ...cssProp,
      }}
    >
      <Box
        as="span"
        aria-hidden="true"
        data-feed-panel-bar=""
        css={{
          display: "block",
          color: "#3d3d3d",
          bg: "linear-gradient(to bottom, #ebebeb 0%, #d9d9d9 45%, #bdbdbd 100%)",
          borderBottom: "1px solid #7c7c7c",
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
          userSelect: "none",
          textShadow: "0 1px 0 rgba(255, 255, 255, 0.7)",
        }}
      >
        <Box
          as="span"
          css={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            h: "1.25rem",
            px: "0.375rem",
          }}
        >
          <Box as="span" css={{ display: "flex", gap: "0.375rem" }}>
            {TRAFFIC_LIGHTS.map((light) => (
              <Box
                as="span"
                key={light.glyph}
                data-traffic-light=""
                css={{
                  display: "grid",
                  placeItems: "center",
                  w: "0.6875rem",
                  h: "0.6875rem",
                  borderRadius: "full",
                  boxShadow:
                    "inset 0 1px 1px rgba(255, 255, 255, 0.7), inset 0 -1px 2px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.38), 0 1px 0 rgba(255, 255, 255, 0.6)",
                }}
                style={{ background: light.background }}
              >
                <Box
                  as="span"
                  data-window-glyph=""
                  css={{
                    color: "rgba(0, 0, 0, 0.55)",
                    opacity: 0,
                    fontSize: "0.5rem",
                    fontWeight: "bold",
                    transition: "opacity 0.15s",
                    textShadow: "none",
                  }}
                >
                  {light.glyph}
                </Box>
              </Box>
            ))}
          </Box>
          <Box as="span" css={{ display: "flex", alignItems: "center", gap: "1" }}>
            <svg viewBox="0 0 16 13" style={{ width: "0.75rem", height: "0.625rem" }}>
              <path
                d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3.6l1.5 1.6h5.9A1.5 1.5 0 0 1 15 4.1v6.9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 11z"
                fill="#8fb6e3"
                stroke="#4f78ad"
                strokeWidth="0.8"
              />
            </svg>
            {label}
          </Box>
          <Box
            as="span"
            css={{
              justifySelf: "end",
              w: "1.125rem",
              h: "0.4375rem",
              bg: "linear-gradient(to bottom, #fdfdfd, #c9c9c9)",
              border: "1px solid #8a8a8a",
              borderRadius: "full",
            }}
          />
        </Box>
        <Box
          as="span"
          css={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            h: "1.375rem",
            px: "0.375rem",
            pb: "0.125rem",
          }}
        >
          <Box as="span" css={{ display: "flex" }}>
            {["◀", "▶"].map((arrow) => (
              <Box
                as="span"
                key={arrow}
                css={{
                  display: "grid",
                  placeItems: "center",
                  w: "1.125rem",
                  h: "0.9375rem",
                  color: "#4a4a4a",
                  fontSize: "0.4375rem",
                  bg: "linear-gradient(to bottom, #fbfbfb, #d4d4d4)",
                  border: "1px solid #8d8d8d",
                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                  "&:first-of-type": { borderRadius: "0.1875rem 0 0 0.1875rem" },
                  "&:last-of-type": { borderLeft: "none", borderRadius: "0 0.1875rem 0.1875rem 0" },
                }}
              >
                {arrow}
              </Box>
            ))}
          </Box>
          <Box
            as="span"
            css={{
              display: "flex",
              alignItems: "center",
              w: "4.5rem",
              h: "0.9375rem",
              px: "1.5",
              bg: "#ffffff",
              border: "1px solid #8d8d8d",
              borderRadius: "full",
              boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.25)",
            }}
          >
            <svg viewBox="0 0 10 10" style={{ width: "0.5rem", height: "0.5rem" }}>
              <circle cx="4" cy="4" r="3" fill="none" stroke="#6b6b6b" strokeWidth="1.4" />
              <path d="M6.3 6.3 9 9" stroke="#6b6b6b" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Box>
        </Box>
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
      <Box
        as="span"
        data-feed-panel-status=""
        css={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.5",
          h: "1.125rem",
          px: "4",
          color: "#3a3a3a",
          fontSize: "0.625rem",
          whiteSpace: "nowrap",
          bg: "linear-gradient(to bottom, #dcdcdc 0%, #c2c2c2 100%)",
          borderTop: "1px solid #8e8e8e",
          overflow: "hidden",
          textShadow: "0 1px 0 rgba(255, 255, 255, 0.65)",
        }}
      >
        {total > 1 && <span>{`${pad(post + 1)} / ${pad(total)}`}</span>}
        {caption && (
          <Box
            as="span"
            data-feed-panel-caption=""
            css={{ minW: 0, textOverflow: "ellipsis", overflow: "hidden" }}
          >
            {caption}
          </Box>
        )}
        <Box
          as="span"
          aria-hidden="true"
          css={{
            position: "absolute",
            right: "0.1875rem",
            bottom: "0.1875rem",
            w: "0.5625rem",
            h: "0.5625rem",
            bg: "linear-gradient(135deg, transparent 0 40%, #8a8a8a 40% 47%, transparent 47% 60%, #8a8a8a 60% 67%, transparent 67% 80%, #8a8a8a 80% 87%, transparent 87%)",
          }}
        />
      </Box>
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
