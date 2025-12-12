"use client";

import type { ImgHTMLAttributes } from "react";
import { forwardRef, useState } from "react";
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

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoaded(true);
      onLoad?.(e);
    };

    const handleError = () => {
      setIsLoaded(true);
    };

    // Calculate aspect ratio padding (must be inline - truly dynamic calculation)
    const dynamicAspectRatio = aspectRatio
      ? (() => {
          const [width, height] = aspectRatio.split("/").map(Number);
          return { aspectRatio: `${width} / ${height}`, width: "100%" };
        })()
      : undefined;

    const showBlur = blurOnLoad && !isLoaded && blurDataURL;
    const showCopyrightInside =
      copyright &&
      (copyrightPosition === "inline-white" ||
        copyrightPosition === "inline-black" ||
        copyrightPosition === "overlay");

    return (
      <>
        <Box
          ref={ref}
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
                filter: "blur(20px)",
                transform: "scale(1.1)",
                transition: "opacity 0.3s ease-in-out",
              })}
              style={{ opacity: isLoaded ? 0 : 1 }}
            />
          )}

          {/* Main image */}
          <img
            src={src}
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
              opacity: blurOnLoad && !isLoaded ? 0 : 1,
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
