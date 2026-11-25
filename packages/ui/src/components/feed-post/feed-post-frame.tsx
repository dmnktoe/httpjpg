"use client";

import { type CSSProperties, type UIEvent, useRef, useState } from "react";
import { css } from "styled-system/css";

import { Box } from "../box/box";

export interface FeedPostImage {
  id: string;
  src: string;
  srcSet?: string;
  alt: string;
  /** `contain` shows the whole image with bars in the page colour. @default "cover" */
  fit?: "cover" | "contain";
}

interface FeedPostFrameProps {
  images: FeedPostImage[];
  ratio: string;
  sizes: string;
  onImageClick?: (index: number) => void;
}

const FIT_CLASS = {
  cover: css({ display: "block", w: "full", h: "full", objectFit: "cover" }),
  contain: css({ display: "block", w: "full", h: "full", objectFit: "contain" }),
} as const;

const NAV_CLASS = css({
  position: "absolute",
  top: "50%",
  boxSizing: "border-box",
  display: { base: "none", md: "inline-flex" },
  px: "2",
  py: "1",
  color: "white",
  opacity: 0.75,
  fontFamily: "mono",
  fontSize: "sm",
  lineHeight: 1,
  bg: "rgba(0, 0, 0, 0.55)",
  transform: "translateY(-50%)",
  transition: "opacity 0.2s",
  cursor: "pointer",
  userSelect: "none",
  all: "unset",
  _hover: { opacity: 1 },
  _focusVisible: {
    opacity: 1,
    outline: "2px solid",
    outlineColor: "primary.500",
    outlineOffset: "2px",
  },
});

export function FeedPostFrame({ images, ratio, sizes, onImageClick }: FeedPostFrameProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = images.length;
  const isCarousel = total > 1;

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollLeft, clientWidth } = event.currentTarget;
    if (clientWidth > 0) {
      setActiveIndex(clampIndex(Math.round(scrollLeft / clientWidth), total));
    }
  };

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const next = clampIndex(index, total);
    setActiveIndex(next);
    track.scrollTo?.({ left: next * track.clientWidth, behavior: "smooth" });
  };

  const handlePrevious = () => scrollToIndex(activeIndex - 1);
  const handleNext = () => scrollToIndex(activeIndex + 1);

  return (
    <Box
      data-feed-frame=""
      css={{
        position: "relative",
        aspectRatio: "var(--feed-ratio)",
        w: "full",
        bg: "pageBg",
        overflow: "hidden",
      }}
      style={{ "--feed-ratio": ratio } as CSSProperties}
    >
      <Box
        ref={trackRef}
        onScroll={isCarousel ? handleScroll : undefined}
        css={{
          display: "flex",
          h: "full",
          scrollSnapType: "x mandatory",
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {images.map((image, index) => {
          const img = (
            <img
              src={image.src}
              srcSet={image.srcSet || undefined}
              sizes={image.srcSet ? sizes : undefined}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              draggable={false}
              className={FIT_CLASS[image.fit === "contain" ? "contain" : "cover"]}
            />
          );
          const slideCss = { flex: "0 0 100%", h: "full", scrollSnapAlign: "start" } as const;
          return onImageClick ? (
            <Box
              as="button"
              type="button"
              key={image.id}
              aria-label={image.alt ? `Open ${image.alt} at full size` : "Open at full size"}
              onClick={() => onImageClick(index)}
              css={{
                all: "unset",
                boxSizing: "border-box",
                cursor: "zoom-in",
                ...slideCss,
                _focusVisible: {
                  outline: "2px solid",
                  outlineColor: "primary.500",
                  outlineOffset: "-2px",
                },
              }}
            >
              {img}
            </Box>
          ) : (
            <Box key={image.id} css={slideCss}>
              {img}
            </Box>
          );
        })}
      </Box>
      {isCarousel && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            className={NAV_CLASS}
            style={{ left: 0 }}
            onClick={handlePrevious}
          >
            [ ← ]
          </button>
          <button
            type="button"
            aria-label="Next image"
            className={NAV_CLASS}
            style={{ right: 0 }}
            onClick={handleNext}
          >
            [ → ]
          </button>
          <Box
            aria-hidden="true"
            css={{
              position: "absolute",
              right: "2",
              bottom: "2",
              px: "2",
              py: "1",
              color: "white",
              fontFamily: "mono",
              fontSize: "sm",
              lineHeight: 1,
              bg: "rgba(0, 0, 0, 0.55)",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {`[ ${pad(activeIndex + 1)} / ${pad(total)} ]`}
          </Box>
        </>
      )}
    </Box>
  );
}

function clampIndex(index: number, total: number): number {
  return Math.min(Math.max(index, 0), total - 1);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
