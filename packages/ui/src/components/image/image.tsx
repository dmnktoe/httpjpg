"use client";

import type { ImgHTMLAttributes } from "react";
import { forwardRef, useState } from "react";
import { css, cx } from "../../../styled-system/css";
import { Box } from "../box/box";

/**
 * Image component props
 */
export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
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
   * @default "inline"
   */
  copyrightPosition?: "inline" | "below" | "overlay";
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
      copyrightPosition = "inline",
      blurOnLoad = false,
      blurDataURL,
      objectFit = "cover",
      aspectRatio,
      wrapperStyle,
      wrapperClassName,
      className,
      style,
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

    // Calculate aspect ratio padding
    const aspectRatioPadding = aspectRatio
      ? (() => {
          const [width, height] = aspectRatio.split("/").map(Number);
          return `${(height / width) * 100}%`;
        })()
      : undefined;

    const wrapperStyles: React.CSSProperties = {
      position: "relative",
      display: "block",
      overflow: "hidden",
      boxSizing: "border-box",
      ...wrapperStyle,
      ...(aspectRatioPadding && {
        paddingBottom: aspectRatioPadding,
        height: 0,
      }),
    };

    const imageStyles: React.CSSProperties = {
      objectFit,
      ...style,
      ...(aspectRatio && {
        position: "absolute",
        top: 0,
        left: 0,
      }),
    };

    const showBlur = blurOnLoad && !isLoaded && blurDataURL;
    const showCopyrightInside =
      copyright &&
      (copyrightPosition === "inline" || copyrightPosition === "overlay");

    return (
      <>
        <Box ref={ref} className={cx(wrapperClassName)} style={wrapperStyles}>
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
              ...imageStyles,
              opacity: blurOnLoad && !isLoaded ? 0 : 1,
            }}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />

          {/* Copyright inside image */}
          {showCopyrightInside && (
            <Box
              className={css({
                fontFamily: "mono",
                fontSize: "0.75rem",
                opacity: 0.7,
                boxSizing: "border-box",
              })}
              {...(copyrightPosition === "inline"
                ? {
                    position: "absolute",
                    bottom: "0.5rem",
                    right: "0.5rem",
                    padding: "0.5rem 0.25rem",
                    color: "black",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }
                : {
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background:
                      "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
                    padding: "1rem",
                    color: "white",
                  })}
            >
              {copyright}
            </Box>
          )}
        </Box>

        {/* Copyright below image */}
        {copyright && copyrightPosition === "below" && (
          <Box
            css={{
              fontFamily: "mono",
              fontSize: "0.75rem",
              opacity: 0.7,
              padding: "0.5rem 0",
              color: "currentColor",
            }}
          >
            {copyright}
          </Box>
        )}
      </>
    );
  },
);

Image.displayName = "Image";
