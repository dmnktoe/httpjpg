"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Box } from "../box/box";

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * AspectRatio content
   */
  children: ReactNode;
  /**
   * Aspect ratio preset or custom value
   * @default "16/9"
   */
  ratio?: "1/1" | "4/3" | "16/9" | "21/9" | "9/16" | number;
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
 * and custom numeric values.
 *
 * @example
 * ```tsx
 * <AspectRatio ratio="16/9">
 *   <img src="/photo.jpg" alt="Photo" />
 * </AspectRatio>
 *
 * <AspectRatio ratio="1/1">
 *   <video src="/video.mp4" />
 * </AspectRatio>
 *
 * // Custom numeric ratio
 * <AspectRatio ratio={2.35}>
 *   <img src="/ultrawide.jpg" alt="Cinema" />
 * </AspectRatio>
 * ```
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ children, ratio = "16/9", className, style, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={className}
        style={{
          position: "relative",
          width: "100%",
          boxSizing: "border-box",
          aspectRatio: getRatioValue(ratio),
          ...style,
        }}
        {...props}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {children}
        </div>
      </Box>
    );
  },
);

AspectRatio.displayName = "AspectRatio";
