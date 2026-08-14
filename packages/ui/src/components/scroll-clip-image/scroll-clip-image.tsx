"use client";

import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { CopyrightLabel, type CopyrightPosition } from "../copyright-label/copyright-label";
import { DEFAULT_MAX_CLIP_RATIO, DEFAULT_MAX_SCALE, getEntryProgress, getPinProgress } from "./lib";
import { ScrollClipImageBrackets } from "./scroll-clip-image-brackets";
import { ScrollClipImageProgress } from "./scroll-clip-image-progress";

export interface ScrollClipImageProps {
  src: string;
  alt: string;
  href?: string;
  title?: string;
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
  copyright?: string;
  copyrightSource?: string;
  copyrightPosition?: CopyrightPosition;
  children?: ReactNode;
  fetchPriority?: "auto" | "high" | "low";
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  css?: SystemStyleObject;
  className?: string;
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
      copyrightSource,
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

    const isInlineCredit =
      Boolean(copyright || copyrightSource) &&
      (copyrightPosition === "inline-white" ||
        copyrightPosition === "inline-black" ||
        copyrightPosition === "overlay");
    const isBelowCredit = Boolean(copyright || copyrightSource) && copyrightPosition === "below";

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

        {brackets && <ScrollClipImageBrackets />}
        {pin && showProgress && <ScrollClipImageProgress labelRef={progressLabelRef} />}
        {isInlineCredit && (
          <CopyrightLabel text={copyright} source={copyrightSource} position={copyrightPosition} />
        )}
      </Box>
    );

    const wrapped = href ? (
      <a
        href={href}
        title={title}
        className={css({ display: "block", color: "inherit", textDecoration: "none" })}
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

    return (
      <Box css={{ display: "block", width: "100%" }} className={className} ref={outerRef}>
        {pin ? (
          <Box
            ref={trackerRef}
            style={{ height: `calc(100vh + ${pinDistance})` }}
            css={{ position: "relative", width: "100%" }}
          >
            <Box
              css={{
                position: "sticky",
                top: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100vh",
                overflow: "hidden",
              }}
            >
              <Box css={{ width: "100%" }}>{wrapped}</Box>
            </Box>
          </Box>
        ) : (
          wrapped
        )}
        {isBelowCredit && (
          <CopyrightLabel text={copyright} source={copyrightSource} position="below" />
        )}
        {children}
      </Box>
    );
  },
);
