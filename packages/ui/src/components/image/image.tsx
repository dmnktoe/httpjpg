"use client";

import type { ImgHTMLAttributes } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";
import { CopyrightLabel, type CopyrightPosition } from "../copyright-label";

/**
 * Image component props
 */
export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "css"> {
  /**
   * Image source URL
   */
  src: string;
  /**
   * Alt text for accessibility
   */
  alt: string;
  /**
   * Copyright text
   */
  copyright?: string;
  /**
   * Copyright position
   * @default "inline-white"
   */
  copyrightPosition?: CopyrightPosition;
  /**
   * Enable blur-up loading effect
   * @default false
   */
  blurOnLoad?: boolean;
  /**
   * Low-quality image placeholder (LQIP) for blur effect
   */
  blurDataURL?: string;
  /**
   * Object fit
   * @default "cover"
   */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  /**
   * Aspect ratio (e.g., "16/9", "1/1", "4/3")
   */
  aspectRatio?: string;
  /**
   * Custom styles for the wrapper
   */
  wrapperStyle?: React.CSSProperties;
  /**
   * Custom class name for the wrapper
   */
  wrapperClassName?: string;
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

/**
 * Image component with copyright and blur loading
 *
 * Supports:
 * - Copyright text (inline, below, or overlay)
 * - Blur-up loading effect for better UX
 * - Object fit options
 * - Fully styled with Panda CSS
 *
 * @example
 * ```tsx
 * <Image
 *   src="https://example.com/image.jpg"
 *   alt="Description"
 *   copyright="© 2025 Photographer Name"
 *   copyrightPosition="inline"
 *   blurOnLoad
 *   blurDataURL="/blur.jpg"
 * />
 * ```
 */
export const Image = forwardRef<HTMLDivElement, ImageProps>(
  (
    {
      src,
      alt,
      copyright,
      copyrightPosition = "inline-white",
      blurOnLoad = false,
      blurDataURL,
      objectFit = "cover",
      aspectRatio,
      wrapperStyle,
      wrapperClassName,
      className,
      style,
      css: cssProp,
      onLoad,
      ...props
    },
    ref,
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [highResLoaded, setHighResLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const currentSrcRef = useRef<string>("");

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      // Only set loaded if we're loading the high-res image
      if (blurOnLoad && currentSrcRef.current === src) {
        setHighResLoaded(true);
      }
      setIsLoaded(true);
      onLoad?.(e);
    };

    const handleError = () => {
      setIsLoaded(true);
      setHighResLoaded(true);
    };

    // Intersection Observer for lazy loading with blur effect
    useEffect(() => {
      if (!blurOnLoad) {
        setIsInView(true);
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: "50px", // Start loading slightly before image enters viewport
        },
      );

      observer.observe(container);

      return () => observer.disconnect();
    }, [blurOnLoad]);

    // Check if image is already loaded (e.g., from cache)
    useEffect(() => {
      if (!isInView) return;

      const img = imgRef.current;
      if (img?.complete && img.naturalHeight !== 0 && img.src === src) {
        setIsLoaded(true);
        setHighResLoaded(true);
      }
    }, [isInView, src]);

    // Calculate aspect ratio padding (must be inline - truly dynamic calculation)
    const dynamicAspectRatio = aspectRatio
      ? (() => {
          const [width, height] = aspectRatio.split("/").map(Number);
          return { aspectRatio: `${width} / ${height}`, width: "100%" };
        })()
      : undefined;

    const showBlur = blurOnLoad && !highResLoaded && blurDataURL;
    const showCopyrightInside =
      copyright &&
      (copyrightPosition === "inline-white" ||
        copyrightPosition === "inline-black" ||
        copyrightPosition === "overlay");

    // Don't render if no src provided
    if (!src) {
      return null;
    }

    return (
      <>
        <Box
          ref={(node: HTMLDivElement | null) => {
            // Handle multiple refs
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            containerRef.current = node;
          }}
          className={cx(
            css({
              position: "relative",
              display: "block",
              overflow: "hidden",
              boxSizing: "border-box",
              ...cssProp,
            }),
            wrapperClassName,
          )}
          style={{ ...wrapperStyle, ...dynamicAspectRatio }}
        >
          {/* Blur placeholder */}
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
                objectFit: "cover",
                filter: "blur(20px)",
                transform: "scale(1.1)",
                transition: "opacity 0.3s ease-in-out",
              })}
              style={{ opacity: highResLoaded ? 0 : 1 }}
            />
          )}

          {/* Main image */}
          <img
            ref={(node) => {
              if (node) {
                imgRef.current = node;
                // Track current src for load detection
                const imgSrc = isInView ? src : blurDataURL || src;
                currentSrcRef.current = imgSrc;
              }
            }}
            src={isInView ? src : blurDataURL || src}
            alt={alt}
            className={cx(
              css({
                width: "100%",
                height: "100%",
                display: "block",
                boxSizing: "border-box",
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
            onError={handleError}
            {...props}
          />

          {/* Copyright inline white (vertical on right side) */}
          {showCopyrightInside && copyrightPosition === "inline-white" && (
            <CopyrightLabel text={copyright} position="inline-white" />
          )}

          {/* Copyright overlay (bottom gradient) */}
          {showCopyrightInside && copyrightPosition === "overlay" && (
            <CopyrightLabel text={copyright} position="overlay" />
          )}

          {/* Copyright inline black */}
          {showCopyrightInside && copyrightPosition === "inline-black" && (
            <CopyrightLabel text={copyright} position="inline-black" />
          )}
        </Box>

        {/* Copyright below image */}
        {copyright && copyrightPosition === "below" && (
          <CopyrightLabel text={copyright} position="below" />
        )}
      </>
    );
  },
);

Image.displayName = "Image";
