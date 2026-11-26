"use client";

import {
  type CSSProperties,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
  type UIEvent,
  useRef,
  useState,
} from "react";
import { css } from "styled-system/css";

import { Box } from "../box/box";
import { Link } from "../link/link";

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
  /** Makes every image a link, e.g. to the post's own page. Wins over `onImageClick`. */
  imageHref?: string;
  onImageClick?: (index: number) => void;
}

interface DragState {
  startX: number;
  startLeft: number;
  startIndex: number;
  hasMoved: boolean;
}

const SLIDE_GAP_PX = 1;
const DRAG_THRESHOLD_PX = 5;
const DRAG_STEP_RATIO = 0.15;

const FIT_CLASS = {
  cover: css({ display: "block", w: "full", h: "full", objectFit: "cover" }),
  contain: css({ display: "block", w: "full", h: "full", objectFit: "contain" }),
} as const;

const SLIDE_CSS = {
  all: "unset",
  boxSizing: "border-box",
  display: "block",
  flex: "0 0 100%",
  h: "full",
  scrollSnapAlign: "start",
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "primary.500",
    outlineOffset: "-2px",
  },
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

export function FeedPostFrame({
  images,
  ratio,
  sizes,
  imageHref,
  onImageClick,
}: FeedPostFrameProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const swallowsClickRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const total = images.length;
  const isCarousel = total > 1;

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (dragRef.current?.hasMoved) {
      return;
    }
    setActiveIndex(nearestIndex(event.currentTarget, total));
  };

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const next = clampIndex(index, total);
    setActiveIndex(next);
    track.scrollTo?.({ left: next * (track.clientWidth + SLIDE_GAP_PX), behavior: "smooth" });
  };

  const handlePrevious = () => scrollToIndex(activeIndex - 1);
  const handleNext = () => scrollToIndex(activeIndex + 1);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }
    dragRef.current = {
      startX: event.clientX,
      startLeft: event.currentTarget.scrollLeft,
      startIndex: activeIndex,
      hasMoved: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    if (!(event.buttons & 1)) {
      endDrag(drag.startIndex);
      return;
    }
    const delta = event.clientX - drag.startX;
    if (!drag.hasMoved) {
      if (Math.abs(delta) < DRAG_THRESHOLD_PX) {
        return;
      }
      drag.hasMoved = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    event.currentTarget.scrollLeft = drag.startLeft - delta;
  };

  const endDrag = (index: number) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setIsDragging(false);
    if (drag?.hasMoved) {
      scrollToIndex(index);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag?.hasMoved) {
      endDrag(activeIndex);
      return;
    }
    swallowsClickRef.current = true;
    window.setTimeout(() => {
      swallowsClickRef.current = false;
    }, 0);
    const delta = event.clientX - drag.startX;
    const width = event.currentTarget.clientWidth || 1;
    const step = Math.abs(delta) > width * DRAG_STEP_RATIO ? -Math.sign(delta) : 0;
    endDrag(drag.startIndex + step);
  };

  const handlePointerCancel = () => {
    endDrag(dragRef.current?.startIndex ?? activeIndex);
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (swallowsClickRef.current) {
      swallowsClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <>
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
          data-dragging={isDragging || undefined}
          onScroll={isCarousel ? handleScroll : undefined}
          onPointerDown={isCarousel ? handlePointerDown : undefined}
          onPointerMove={isCarousel ? handlePointerMove : undefined}
          onPointerUp={isCarousel ? handlePointerUp : undefined}
          onPointerCancel={isCarousel ? handlePointerCancel : undefined}
          onDragStart={isCarousel ? handleDragStart : undefined}
          onClickCapture={isCarousel ? handleClickCapture : undefined}
          css={{
            display: "flex",
            gap: `${SLIDE_GAP_PX}px`,
            h: "full",
            scrollSnapType: "x mandatory",
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            "&[data-dragging]": { cursor: "grabbing", userSelect: "none", scrollSnapType: "none" },
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
            if (imageHref) {
              return (
                <Link
                  key={image.id}
                  href={imageHref}
                  aria-label={image.alt ? `Open the post: ${image.alt}` : "Open the post"}
                  data-cursor="open post"
                  draggable={false}
                  css={{ ...SLIDE_CSS, cursor: "pointer" }}
                >
                  {img}
                </Link>
              );
            }
            if (onImageClick) {
              return (
                <Box
                  as="button"
                  type="button"
                  key={image.id}
                  aria-label={image.alt ? `Open ${image.alt} at full size` : "Open at full size"}
                  data-cursor="zoom"
                  onClick={() => onImageClick(index)}
                  css={{ ...SLIDE_CSS, cursor: "zoom-in" }}
                >
                  {img}
                </Box>
              );
            }
            return (
              <Box key={image.id} css={{ flex: "0 0 100%", h: "full", scrollSnapAlign: "start" }}>
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
                top: "2",
                right: "2",
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
      {isCarousel && (
        <Box
          aria-hidden="true"
          data-feed-dots=""
          css={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1" }}
        >
          {images.map((image, index) => (
            <Box
              key={image.id}
              data-active={index === activeIndex || undefined}
              css={{
                w: "0.375rem",
                h: "0.375rem",
                opacity: 0.25,
                bg: "pageFg",
                borderRadius: "full",
                transition: "opacity 0.2s",
                "&[data-active]": { opacity: 1 },
              }}
            />
          ))}
        </Box>
      )}
    </>
  );
}

function nearestIndex(track: HTMLElement, total: number): number {
  const width = track.clientWidth;
  if (width <= 0) {
    return 0;
  }
  return clampIndex(Math.round(track.scrollLeft / (width + SLIDE_GAP_PX)), total);
}

function clampIndex(index: number, total: number): number {
  return Math.min(Math.max(index, 0), total - 1);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
