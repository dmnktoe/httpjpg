"use client";

import { css, cx } from "@linaria/core";
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

const aspectRatioBase = css`
  position: relative;
  width: 100%;
  box-sizing: border-box;

  & > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const getRatioValue = (ratio: AspectRatioProps["ratio"]): string => {
  if (typeof ratio === "number") {
    return `${ratio}`;
  }
  return ratio || "16/9";
};

/**
 * AspectRatio component - Maintain aspect ratio for media
 * Perfect for images and videos in grid layouts
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ children, ratio = "16/9", className, style, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={cx(aspectRatioBase, className)}
        style={{
          aspectRatio: getRatioValue(ratio),
          ...style,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  },
);

AspectRatio.displayName = "AspectRatio";
