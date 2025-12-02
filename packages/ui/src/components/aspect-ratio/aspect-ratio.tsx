"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export interface AspectRatioProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "css"> {
  /**
   * AspectRatio content
   */
  children: ReactNode;
  /**
   * Aspect ratio preset or custom value
   * @default "16/9"
   */
  ratio?: "1/1" | "4/3" | "16/9" | "21/9" | "9/16" | number;
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

const getRatioValue = (ratio: AspectRatioProps["ratio"]): string => {
  if (typeof ratio === "number") {
    return `${ratio}`;
  }
  return ratio || "16/9";
};

/**
 * AspectRatio component - Maintain aspect ratio for media
 *
 * Perfect for images and videos in grid layouts. Supports both preset ratios
 * and custom numeric values. Children are automatically positioned absolutely
 * to fill the container.
 *
 * @example
 * ```tsx
 * <AspectRatio ratio="16/9">
 *   <img src="/photo.jpg" alt="Photo" style={{ objectFit: 'cover' }} />
 * </AspectRatio>
 *
 * <AspectRatio ratio="1/1">
 *   <video src="/video.mp4" />
 * </AspectRatio>
 *
 * // Custom numeric ratio (e.g., 2.35:1 for cinema)
 * <AspectRatio ratio={2.35}>
 *   <img src="/ultrawide.jpg" alt="Cinema" />
 * </AspectRatio>
 *
 * // With iframe (YouTube, Vimeo)
 * <AspectRatio ratio="16/9">
 *   <iframe src="..." />
 * </AspectRatio>
 * ```
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ children, ratio = "16/9", className, css: cssProp, ...props }, ref) => {
    const ratioValue = getRatioValue(ratio);

    return (
      <Box
        ref={ref}
        className={className}
        css={{
          position: "relative",
          w: "100%",
          overflow: "hidden",
          ...cssProp,
        }}
        style={{ aspectRatio: ratioValue }}
        {...props}
      >
        <Box
          css={{
            position: "absolute",
            inset: 0,
            w: "100%",
            h: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    );
  },
);

AspectRatio.displayName = "AspectRatio";
