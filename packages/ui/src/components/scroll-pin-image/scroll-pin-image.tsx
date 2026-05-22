"use client";

import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { CopyrightLabel, type CopyrightPosition } from "../copyright-label/copyright-label";

const DEFAULT_MAX_CLIP_RATIO = 12;
const DEFAULT_MAX_SCALE = 1.15;

export interface ScrollPinImageProps {
  src: string;
  alt: string;
  /** Optional href; the image becomes a link wrapper. */
  href?: string;
  title?: string;
  srcSet?: string;
  sizes?: string;
  /** Aspect ratio of the visual mask. @default "16/9" */
  aspectRatio?: string;
  /**
   * Extra scroll distance over which the reveal plays out while the
   * element is pinned at the viewport center. Any CSS length.
   * @default "100vh"
   */
  pinDistance?: string;
  /** Initial `clip-path: inset()` percentage. @default 12 */
  maxClipRatio?: number;
  /** Initial image scale. @default 1.15 */
  maxScale?: number;
  /** ASCII corner brackets that ride the mask edges. @default true */
  brackets?: boolean;
  /** Render a small `[ NN / 99 ]` progress label in the corner. @default true */
  showProgress?: boolean;
  copyright?: string;
  copyrightPosition?: CopyrightPosition;
  /** Slotted below the pinned reveal (e.g. caption). */
  children?: ReactNode;
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

export const ScrollPinImage = forwardRef<HTMLDivElement, ScrollPinImageProps>(
  function ScrollPinImage(
    {
      src,
      alt,
      href,
      title,
      srcSet,
      sizes,
      aspectRatio = "16/9",
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
    const pinRef = useRef<HTMLDivElement>(null);
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
      const pin = pinRef.current;
      const mask = maskRef.current;
      if (!pin || !mask) {
        return;
      }
      if (reduceMotion) {
        mask.style.setProperty("--clip-ratio", "0%");
        mask.style.setProperty("--scale-ratio", "1");
        return;
      }

      let raf = 0;
      let isVisible = true;

      const update = () => {
        raf = 0;
        if (!isVisible) {
          return;
        }
        const rect = pin.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const travel = rect.height - vh;
        let progress = 0;
        if (travel <= 0) {
          progress = 1;
        } else if (rect.top >= 0) {
          progress = 0;
        } else if (rect.bottom <= vh) {
          progress = 1;
        } else {
          progress = Math.max(0, Math.min(1, -rect.top / travel));
        }
        const clip = (1 - progress) * maxClipRatio;
        const scale = 1 + (1 - progress) * (maxScale - 1);
        mask.style.setProperty("--clip-ratio", `${clip}%`);
        mask.style.setProperty("--scale-ratio", `${scale}`);
        if (progressLabelRef.current) {
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
            isVisible = entry.isIntersecting;
          }
          schedule();
        },
        { threshold: 0 },
      );
      observer.observe(pin);

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
    }, [maxClipRatio, maxScale, reduceMotion]);

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

        {showProgress && (
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

    return (
      <Box
        css={{ display: "block", width: "100%" }}
        className={className}
        ref={(node: HTMLDivElement | null) => {
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
      >
        <Box
          ref={pinRef}
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
  },
);
