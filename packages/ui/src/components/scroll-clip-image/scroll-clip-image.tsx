"use client";

import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { CopyrightLabel, type CopyrightPosition } from "../copyright-label/copyright-label";

const DEFAULT_MAX_CLIP_RATIO = 10;
const DEFAULT_MAX_SCALE = 1.1;

export interface ScrollClipImageProps {
  src: string;
  alt: string;
  /** Optional href; when set, the image becomes a link wrapper. */
  href?: string;
  /** Title for the link (tooltip). */
  title?: string;
  /** `srcSet` / `sizes` passthrough. */
  srcSet?: string;
  sizes?: string;
  /** CSS aspect-ratio string. @default "16/9" */
  aspectRatio?: string;
  /**
   * When `true`, the image pins at viewport center via a sticky container
   * and the reveal plays out across `pinDistance` of extra scroll. When
   * `false`, the reveal is driven by the element's travel from viewport
   * entry to viewport center.
   * @default false
   */
  pin?: boolean;
  /**
   * Pin mode only: extra scroll distance over which the reveal plays out
   * while the element is pinned. Any CSS length.
   * @default "100vh"
   */
  pinDistance?: string;
  /**
   * Maximum `clip-path: inset()` percentage at the start of the reveal.
   * @default 10
   */
  maxClipRatio?: number;
  /**
   * Maximum image scale at the start of the reveal.
   * @default 1.1
   */
  maxScale?: number;
  /**
   * Show ASCII corner brackets that retreat with the mask.
   * @default true
   */
  brackets?: boolean;
  /**
   * Pin mode only: render a small `[ NN / 99 ]` progress label in the corner.
   * Ignored when `pin` is `false`.
   * @default true
   */
  showProgress?: boolean;
  /** Copyright text. */
  copyright?: string;
  copyrightPosition?: CopyrightPosition;
  /** Slotted below the image (e.g. caption). */
  children?: ReactNode;
  /** LCP hint. */
  fetchPriority?: "auto" | "high" | "low";
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  css?: SystemStyleObject;
  className?: string;
}

const bracketBaseClass = css({
  position: "absolute",
  fontFamily: "mono",
  fontSize: "lg",
  lineHeight: 1,
  color: "white",
  userSelect: "none",
  pointerEvents: "none",
  zIndex: "docked",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
  transition:
    "opacity 120ms cubic-bezier(.35, 0, 0, 1), transform 200ms cubic-bezier(.35, 0, 0, 1)",
});

function getEntryProgress(rect: DOMRect, viewportHeight: number): number {
  // 0 = element top at bottom of viewport (entry).
  // 1 = element center at center of viewport (settled).
  const startDistance = viewportHeight;
  const endDistance = (viewportHeight - rect.height) / 2;
  const travel = startDistance - endDistance;
  if (travel <= 0) {
    return rect.top <= endDistance ? 1 : 0;
  }
  const consumed = startDistance - rect.top;
  return Math.max(0, Math.min(1, consumed / travel));
}

function getPinProgress(rect: DOMRect, viewportHeight: number): number {
  const travel = rect.height - viewportHeight;
  if (travel <= 0) {
    return 1;
  }
  if (rect.top >= 0) {
    return 0;
  }
  if (rect.bottom <= viewportHeight) {
    return 1;
  }
  return Math.max(0, Math.min(1, -rect.top / travel));
}

export const ScrollClipImage = forwardRef<HTMLDivElement, ScrollClipImageProps>(
  function ScrollClipImage(
    {
      src,
      alt,
      href,
      title,
      srcSet,
      sizes,
      aspectRatio = "16/9",
      pin = false,
      pinDistance = "100vh",
      maxClipRatio = DEFAULT_MAX_CLIP_RATIO,
      maxScale = DEFAULT_MAX_SCALE,
      brackets = true,
      showProgress = true,
      copyright,
      copyrightPosition = "inline-white",
      children,
      fetchPriority = "auto",
      objectFit = "cover",
      css: cssProp,
      className,
    },
    ref,
  ) {
    const trackerRef = useRef<HTMLDivElement>(null);
    const maskRef = useRef<HTMLDivElement>(null);
    const progressLabelRef = useRef<HTMLSpanElement>(null);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const apply = () => setReduceMotion(mq.matches);
      apply();
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }, []);

    useEffect(() => {
      // In pin mode the tracker is the outer scroll wrapper; in non-pin
      // mode the tracker is the mask element itself.
      const tracker = pin ? trackerRef.current : maskRef.current;
      const mask = maskRef.current;
      if (!tracker || !mask) {
        return;
      }
      if (reduceMotion) {
        mask.style.setProperty("--clip-ratio", "0%");
        mask.style.setProperty("--scale-ratio", "1");
        return;
      }

      let raf = 0;
      let isObserved = true;

      const update = () => {
        raf = 0;
        if (!isObserved) {
          return;
        }
        const rect = tracker.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const progress = pin ? getPinProgress(rect, vh) : getEntryProgress(rect, vh);
        const clip = (1 - progress) * maxClipRatio;
        const scale = 1 + (1 - progress) * (maxScale - 1);
        mask.style.setProperty("--clip-ratio", `${clip}%`);
        mask.style.setProperty("--scale-ratio", `${scale}`);
        if (pin && progressLabelRef.current) {
          progressLabelRef.current.textContent = String(Math.round(progress * 99)).padStart(2, "0");
        }
      };

      const schedule = () => {
        if (raf) {
          return;
        }
        raf = requestAnimationFrame(update);
      };

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            isObserved = entry.isIntersecting;
          }
          schedule();
        },
        { threshold: 0 },
      );
      observer.observe(tracker);

      update();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });

      return () => {
        observer.disconnect();
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        if (raf) {
          cancelAnimationFrame(raf);
        }
      };
    }, [pin, maxClipRatio, maxScale, reduceMotion]);

    const initialStyle = {
      "--clip-ratio": `${maxClipRatio}%`,
      "--scale-ratio": String(maxScale),
    } as CSSProperties;

    const maskNode = (
      <Box
        ref={maskRef}
        style={initialStyle}
        css={{
          position: "relative",
          display: "block",
          width: "100%",
          aspectRatio,
          overflow: "hidden",
          clipPath: "inset(var(--clip-ratio, 0%))",
          transition: "clip-path 80ms cubic-bezier(.35, 0, 0, 1)",
          willChange: "clip-path",
          ...cssProp,
        }}
      >
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          decoding="async"
          fetchPriority={fetchPriority}
          className={cx(
            css({
              position: "absolute",
              inset: 0,
              display: "block",
              width: "100%",
              height: "100%",
              transition: "transform 80ms cubic-bezier(.35, 0, 0, 1)",
              willChange: "transform",
            }),
          )}
          style={{
            objectFit,
            transform: "scale(var(--scale-ratio, 1))",
            transformOrigin: "center center",
          }}
        />

        {brackets && (
          <>
            <span
              aria-hidden="true"
              className={bracketBaseClass}
              style={{
                top: "calc(var(--clip-ratio, 0%) + 6px)",
                left: "calc(var(--clip-ratio, 0%) + 6px)",
              }}
            >
              ┌
            </span>
            <span
              aria-hidden="true"
              className={bracketBaseClass}
              style={{
                top: "calc(var(--clip-ratio, 0%) + 6px)",
                right: "calc(var(--clip-ratio, 0%) + 6px)",
              }}
            >
              ┐
            </span>
            <span
              aria-hidden="true"
              className={bracketBaseClass}
              style={{
                bottom: "calc(var(--clip-ratio, 0%) + 6px)",
                left: "calc(var(--clip-ratio, 0%) + 6px)",
              }}
            >
              └
            </span>
            <span
              aria-hidden="true"
              className={bracketBaseClass}
              style={{
                bottom: "calc(var(--clip-ratio, 0%) + 6px)",
                right: "calc(var(--clip-ratio, 0%) + 6px)",
              }}
            >
              ┘
            </span>
          </>
        )}

        {pin && showProgress && (
          <Box
            aria-hidden="true"
            css={{
              position: "absolute",
              top: 3,
              right: 3,
              fontFamily: "mono",
              fontSize: "xs",
              color: "white",
              letterSpacing: "wider",
              userSelect: "none",
              pointerEvents: "none",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
              zIndex: "docked",
            }}
          >
            [ <span ref={progressLabelRef}>00</span> / 99 ]
          </Box>
        )}

        {copyright &&
          (copyrightPosition === "inline-white" ||
            copyrightPosition === "inline-black" ||
            copyrightPosition === "overlay") && (
            <CopyrightLabel text={copyright} position={copyrightPosition} />
          )}
      </Box>
    );

    const wrapped = href ? (
      <a
        href={href}
        title={title}
        className={css({
          display: "block",
          textDecoration: "none",
          color: "inherit",
        })}
      >
        {maskNode}
      </a>
    ) : (
      maskNode
    );

    const outerRef = (node: HTMLDivElement | null) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    if (pin) {
      return (
        <Box css={{ display: "block", width: "100%" }} className={className} ref={outerRef}>
          <Box
            ref={trackerRef}
            style={{ height: `calc(100vh + ${pinDistance})` }}
            css={{ position: "relative", width: "100%" }}
          >
            <Box
              css={{
                position: "sticky",
                top: 0,
                width: "100%",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Box css={{ width: "100%" }}>{wrapped}</Box>
            </Box>
          </Box>
          {copyright && copyrightPosition === "below" && (
            <CopyrightLabel text={copyright} position="below" />
          )}
          {children}
        </Box>
      );
    }

    return (
      <Box css={{ display: "block", width: "100%" }} className={className} ref={outerRef}>
        {wrapped}
        {copyright && copyrightPosition === "below" && (
          <CopyrightLabel text={copyright} position="below" />
        )}
        {children}
      </Box>
    );
  },
);
