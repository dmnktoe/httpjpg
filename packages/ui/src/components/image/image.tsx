import { css, cx } from "@linaria/core";
import type { CSSProperties, ImgHTMLAttributes } from "react";
import { forwardRef, useState } from "react";
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
   */
  copyrightPosition?: "inline" | "below" | "overlay";
  /**
   * Enable blur-up loading effect
   */
  blurOnLoad?: boolean;
  /**
   * Low-quality image placeholder (LQIP) for blur effect
   */
  blurDataURL?: string;
  /**
   * Object fit
   */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  /**
   * Aspect ratio (e.g., "16/9", "1/1", "4/3")
   */
  aspectRatio?: string;
  /**
   * Custom styles for the wrapper
   */
  wrapperStyle?: CSSProperties;
  /**
   * Custom class name for the wrapper
   */
  wrapperClassName?: string;
}

/**
 * Base styles for the image wrapper
 */
const imageWrapperBase = css`
  position: relative;
  display: block;
  overflow: hidden;
  box-sizing: border-box;
`;

/**
 * Base styles for the image
 */
const imageBase = css`
  width: 100%;
  height: 100%;
  display: block;
  box-sizing: border-box;
  transition: opacity 0.3s ease-in-out;
`;

/**
 * Blur placeholder styles
 */
const blurPlaceholder = css`
  position: absolute;
  inset: 0;
  filter: blur(20px);
  transform: scale(1.1);
  transition: opacity 0.3s ease-in-out;
`;

/**
 * Copyright text styles
 */
const copyrightBase = css`
  font-family: monospace;
  font-size: 0.75rem;
  opacity: 0.7;
  box-sizing: border-box;
`;

const copyrightInline = css`
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  padding: 0.5rem 0.25rem;
  color: black;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
`;

const copyrightOverlay = css`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 1rem;
  color: white;
`;

const copyrightBelow = css`
  padding: 0.5rem 0;
  color: currentColor;
`;

/**
 * Loaded image state
 */
const imageLoaded = css`
  opacity: 1;
`;

const imageLoading = css`
  opacity: 0;
`;

/**
 * Image component with copyright and blur loading
 *
 * Supports:
 * - Copyright text (inline, below, or overlay)
 * - Blur-up loading effect for better UX
 * - Aspect ratio control
 * - Object fit options
 * - Storyblok compatibility
 *
 * @example
 * ```tsx
 * <Image
 *   src="https://example.com/image.jpg"
 *   alt="Description"
 *   copyright="© 2025 Photographer Name"
 *   copyrightPosition="inline"
 *   blurOnLoad
 *   aspectRatio="16/9"
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

    const wrapperStyles: CSSProperties = {
      ...wrapperStyle,
      ...(aspectRatioPadding && {
        paddingBottom: aspectRatioPadding,
        height: 0,
      }),
    };

    const imageStyles: CSSProperties = {
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
        <Box
          ref={ref}
          className={cx(imageWrapperBase, wrapperClassName)}
          style={wrapperStyles}
        >
          {/* Blur placeholder */}
          {showBlur && (
            <img
              src={blurDataURL}
              alt=""
              aria-hidden="true"
              className={blurPlaceholder}
              style={{ opacity: isLoaded ? 0 : 1 }}
            />
          )}

          {/* Main image */}
          <img
            src={src}
            alt={alt}
            className={cx(
              imageBase,
              className,
              blurOnLoad ? (isLoaded ? imageLoaded : imageLoading) : undefined,
            )}
            style={imageStyles}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />

          {/* Copyright inside image */}
          {showCopyrightInside && (
            <Box
              className={cx(
                copyrightBase,
                copyrightPosition === "inline"
                  ? copyrightInline
                  : copyrightOverlay,
              )}
            >
              {copyright}
            </Box>
          )}
        </Box>

        {/* Copyright below image */}
        {copyright && copyrightPosition === "below" && (
          <Box className={cx(copyrightBase, copyrightBelow)}>{copyright}</Box>
        )}
      </>
    );
  },
);

Image.displayName = "Image";
