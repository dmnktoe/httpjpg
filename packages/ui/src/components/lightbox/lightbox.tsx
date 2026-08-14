"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { css } from "styled-system/css";

import { useBodyScrollLock } from "../../lib/use-body-scroll-lock";
import { Box } from "../box/box";
import { Video, type VideoSource } from "../video/video";
import { LightboxBar } from "./lightbox-bar";
import { LightboxCaption } from "./lightbox-caption";
import { type PageTheme, usePageTheme } from "./use-page-theme";

export type { PageTheme };

export interface LightboxVideo {
  /** `native` plays the file at `src`; the others embed it. @default "native" */
  source?: VideoSource;
  poster?: string;
  /** @default "16/9" */
  aspectRatio?: string;
}

export interface LightboxItem {
  /** Image URL, or the file / embed URL when `video` is set. */
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  caption?: string;
  /** Credit line; the © symbol is prepended by `CopyrightLabel`. */
  copyright?: string;
  /** Renders a player in place of the image. */
  video?: LightboxVideo;
}

export interface LightboxProps {
  open: boolean;
  items: LightboxItem[];
  /** Index of the visible item. Out-of-range values are clamped. */
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  /** Pins the theme instead of mirroring the page's. Mostly for stories. */
  theme?: PageTheme;
}

/** Tab stops the trap cycles between. */
const FOCUSABLE_SELECTOR = 'a[href], button, [tabindex]:not([tabindex="-1"])';

/** Enter is a touch slower than exit, so dismissing feels immediate. */
const ENTER_TRANSITION = { duration: 0.18, ease: [0.16, 1, 0.3, 1] } as const;
const EXIT_TRANSITION = { duration: 0.12, ease: "easeIn" } as const;

/** Horizontal travel that counts as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 48;

export function Lightbox({ open, items, index, onClose, onIndexChange, theme }: LightboxProps) {
  const [isMounted, setIsMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const swipeOriginRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const resolvedTheme = usePageTheme(theme);

  useBodyScrollLock(open);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const count = items.length;
  const safeIndex = count > 0 ? Math.min(Math.max(index, 0), count - 1) : 0;
  const item = items[safeIndex];

  useEffect(() => {
    if (!open || !isMounted) {
      return;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, [open, isMounted]);

  // Warm the neighbours so a prev/next lands on a decoded image instead of a
  // blank frame. Browsers dedupe against the cache, so this costs one request
  // per image at most.
  useEffect(() => {
    if (!open || count < 2) {
      return;
    }
    for (const offset of [1, -1]) {
      const neighbour = items[(safeIndex + offset + count) % count];
      // Videos are streamed by the player, not warmed here.
      if (neighbour?.src && !neighbour.video) {
        const preload = new window.Image();
        preload.src = neighbour.src;
      }
    }
  }, [open, count, safeIndex, items]);

  if (!isMounted || !item) {
    return null;
  }

  const hasNavigation = count > 1;

  const step = (offset: number) => {
    if (!hasNavigation) {
      return;
    }
    onIndexChange((safeIndex + offset + count) % count);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeOriginRef.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const origin = swipeOriginRef.current;
    swipeOriginRef.current = null;
    if (origin === null) {
      return;
    }
    const travelled = event.clientX - origin;
    if (Math.abs(travelled) >= SWIPE_THRESHOLD) {
      step(travelled < 0 ? 1 : -1);
    }
  };

  // Reduced motion keeps the fade — it carries no movement — but drops the
  // scale, which is the part that reads as motion.
  const frameFrom = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 };
  const frameEnter = prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 };
  const frameExit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99 };

  const lightbox = (
    <AnimatePresence>
      {open && (
        <m.div
          key="lightbox-backdrop"
          onMouseDown={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: EXIT_TRANSITION }}
          transition={ENTER_TRANSITION}
          style={{ WebkitBackdropFilter: "blur(12px)" }}
          className={css({
            position: "fixed",
            inset: "0",
            zIndex: "lightbox",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: { base: "3", md: "6" },
            bg: "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(12px)",
          })}
        >
          <m.div
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            ref={dialogRef}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            onMouseDown={(event: MouseEvent) => event.stopPropagation()}
            initial={frameFrom}
            animate={frameEnter}
            exit={{ ...frameExit, transition: EXIT_TRANSITION }}
            transition={ENTER_TRANSITION}
            className={css({
              display: "flex",
              flexDirection: "column",
              maxW: "min(1280px, 100%)",
              maxH: "100%",
              color: "pageFg",
              bg: "pageBg",
              border: "1px solid",
              borderColor: "pageBorder",
              outline: "none",
              boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.45)",
            })}
          >
            <LightboxBar
              current={safeIndex + 1}
              total={count}
              hasNavigation={hasNavigation}
              onClose={onClose}
              onPrev={() => step(-1)}
              onNext={() => step(1)}
            />

            <Box
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              css={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minH: "0",
                p: { base: "2", md: "3" },
                touchAction: "pan-y",
              }}
            >
              {item.video ? (
                // Width-bounded rather than height-bounded: the player derives
                // its own height from the aspect ratio, and an embed cannot be
                // measured from here to bound it the way an image is.
                <Box key={item.src} css={{ w: "full", maxW: "min(1100px, 100%)" }}>
                  <Video
                    src={item.src}
                    source={item.video.source}
                    poster={item.video.poster}
                    aspectRatio={item.video.aspectRatio ?? "16/9"}
                    controls
                  />
                </Box>
              ) : (
                <img
                  key={item.src}
                  src={item.src}
                  srcSet={item.srcSet}
                  sizes={item.sizes}
                  alt={item.alt}
                  decoding="async"
                  className={css({
                    w: "auto",
                    maxW: "100%",
                    h: "auto",
                    maxH: "min(78dvh, 100%)",
                    objectFit: "contain",
                  })}
                />
              )}
            </Box>

            <LightboxCaption caption={item.caption} copyright={item.copyright} />
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );

  return createPortal(
    // Panda's `_pageDark` condition matches `[data-theme=dark] &`, and this
    // subtree hangs off `document.body` — outside whatever carries the page's
    // attribute. Restating it here is what keeps the frame in the page's theme.
    <div data-theme={resolvedTheme}>{lightbox}</div>,
    document.body,
  );
}
