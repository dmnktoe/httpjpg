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
  copyrightPosition?: CopyrightPosition;
  blurOnLoad?: boolean;
  blurDataURL?: string;
  /** Set `"high"` on the LCP image. */
  fetchPriority?: "auto" | "high" | "low";
  /** `srcSet`/`sizes` are gated on `isInView` so the blur placeholder wins the first paint. */
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
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(!blurOnLoad);
    const [highResLoaded, setHighResLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const currentSrcRef = useRef<string>("");

    useEffect(() => {
      if (!blurOnLoad) {
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
    }, [blurOnLoad]);

    useEffect(() => {
      if (!isInView) {
        return;
      }
      const img = imgRef.current;
      if (img?.complete && img.naturalHeight !== 0 && img.src === src) {
        setIsLoaded(true);
        setHighResLoaded(true);
      }
    }, [isInView, src]);

    if (!src) {
      return null;
    }

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (blurOnLoad && currentSrcRef.current === src) {
        setHighResLoaded(true);
      }
      setIsLoaded(true);
      onLoad?.(e);
    };

    const showBlur = blurOnLoad && !highResLoaded && blurDataURL;
    const showSkeleton = blurOnLoad && !blurDataURL;
    const inline =
      copyright &&
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
              opacity: blurOnLoad && !highResLoaded ? 0 : isLoaded ? 1 : 1,
            }}
            onLoad={handleLoad}
            onError={() => {
              setIsLoaded(true);
              setHighResLoaded(true);
            }}
            {...props}
          />

          {inline && <CopyrightLabel text={copyright} position={copyrightPosition} />}
        </Box>

        {copyright && copyrightPosition === "below" && (
          <CopyrightLabel text={copyright} position="below" />
        )}
      </>
    );
  },
);

Image.displayName = "Image";
