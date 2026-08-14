"use client";

import type { ImgHTMLAttributes } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Box } from "../box/box";
import { CopyrightLabel, type CopyrightPosition } from "../copyright-label/copyright-label";

const skeletonClass = css({
  position: "absolute",
  inset: 0,
  w: "100%",
  h: "100%",
  bg: "linear-gradient(90deg, var(--colors-neutral-200) 0%, var(--colors-neutral-300) 50%, var(--colors-neutral-200) 100%)",
  backgroundSize: "200% 100%",
  transition: "opacity 0.4s ease-in-out",
  animation: "shimmer 1.5s ease-in-out infinite",
  pointerEvents: "none",
  _pageDark: {
    bg: "linear-gradient(90deg, var(--colors-neutral-800) 0%, var(--colors-neutral-700) 50%, var(--colors-neutral-800) 100%)",
  },
});

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "css"> {
  src: string;
  alt: string;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  copyright?: string;
  /** Asset source/credit, shown as a second line below the copyright. */
  copyrightSource?: string;
  copyrightPosition?: CopyrightPosition;
  blurOnLoad?: boolean;
  blurDataURL?: string;
  /** Set `"high"` on the LCP image. */
  fetchPriority?: "auto" | "high" | "low";
  srcSet?: string;
  sizes?: string;
  css?: SystemStyleObject;
}

export const Image = forwardRef<HTMLDivElement, ImageProps>(
  (
    {
      src,
      alt,
      aspectRatio,
      objectFit = "cover",
      copyright,
      copyrightSource,
      copyrightPosition = "inline-white",
      blurOnLoad = false,
      blurDataURL,
      fetchPriority = "auto",
      srcSet,
      sizes,
      className,
      style,
      css: cssProp,
      onLoad,
      ...props
    },
    ref,
  ) => {
    const usesPlaceholder = blurOnLoad && Boolean(blurDataURL);
    const [isInView, setIsInView] = useState(!usesPlaceholder);
    const [highResLoaded, setHighResLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const currentSrcRef = useRef<string>("");

    useEffect(() => {
      if (!usesPlaceholder) {
        return;
      }
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          }
        },
        { rootMargin: "50px" },
      );
      observer.observe(container);
      return () => observer.disconnect();
    }, [usesPlaceholder]);

    useEffect(() => {
      if (!isInView) {
        return;
      }
      const img = imgRef.current;
      if (img?.complete && img.naturalHeight !== 0) {
        setHighResLoaded(true);
      }
    }, [isInView, src, srcSet]);

    if (!src) {
      return null;
    }

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (currentSrcRef.current === src) {
        setHighResLoaded(true);
      }
      onLoad?.(e);
    };

    const showBlur = blurOnLoad && !highResLoaded && blurDataURL;
    const showSkeleton = blurOnLoad && !blurDataURL;
    const hasCredit = Boolean(copyright || copyrightSource);
    const inline =
      hasCredit &&
      (copyrightPosition === "inline-white" ||
        copyrightPosition === "inline-black" ||
        copyrightPosition === "overlay");

    return (
      <>
        <Box
          ref={(node: HTMLDivElement | null) => {
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            containerRef.current = node;
          }}
          css={{
            position: "relative",
            display: "block",
            overflow: "hidden",
            aspectRatio,
            width: aspectRatio ? "100%" : undefined,
            ...cssProp,
          }}
        >
          {showSkeleton && (
            <div
              aria-hidden="true"
              className={skeletonClass}
              style={{ opacity: highResLoaded ? 0 : 1 }}
            />
          )}

          {showBlur && (
            <img
              src={blurDataURL}
              alt=""
              aria-hidden="true"
              className={css({
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                filter: "blur(20px)",
                transform: "scale(1.1)",
                transition: "opacity 0.3s ease-in-out",
                objectFit: "cover",
              })}
              style={{ opacity: highResLoaded ? 0 : 1 }}
            />
          )}

          <img
            ref={(node) => {
              if (node) {
                imgRef.current = node;
                currentSrcRef.current = isInView ? src : blurDataURL || src;
              }
            }}
            src={isInView ? src : blurDataURL || src}
            srcSet={isInView ? srcSet : undefined}
            sizes={isInView && srcSet ? sizes : undefined}
            alt={alt}
            decoding="async"
            fetchPriority={fetchPriority}
            className={cx(
              css({
                display: "block",
                width: "100%",
                height: "100%",
                transition: "opacity 0.3s ease-in-out",
              }),
              className,
            )}
            style={{
              objectFit,
              ...style,
              opacity: blurOnLoad && !highResLoaded ? 0 : 1,
            }}
            onLoad={handleLoad}
            onError={() => setHighResLoaded(true)}
            {...props}
          />

          {inline && (
            <CopyrightLabel
              text={copyright}
              source={copyrightSource}
              position={copyrightPosition}
            />
          )}
        </Box>

        {hasCredit && copyrightPosition === "below" && (
          <CopyrightLabel text={copyright} source={copyrightSource} position="below" />
        )}
      </>
    );
  },
);

Image.displayName = "Image";
