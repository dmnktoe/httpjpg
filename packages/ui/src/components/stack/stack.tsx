"use client";

import { spacing } from "@httpjpg/tokens";
import { css, cx } from "@linaria/core";
import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Box } from "../box/box";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Stack direction
   * @default "vertical"
   */
  direction?: "vertical" | "horizontal";
  /**
   * Spacing between items (using token scale)
   * @default 4
   */
  gap?: keyof typeof spacing;
  /**
   * Alignment of items on cross axis
   * @default "stretch"
   */
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  /**
   * Justification of items on main axis
   * @default "start"
   */
  justify?:
    | "start"
    | "center"
    | "end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  /**
   * Whether items should wrap
   * @default false
   */
  wrap?: boolean;
  /**
   * Stack content
   */
  children: ReactNode;
  /**
   * Full width/height
   * @default false
   */
  fullWidth?: boolean;
  fullHeight?: boolean;
}

const stackBase = css`
  box-sizing: border-box;
  display: flex;
`;

/**
 * Stack component - Flexible layout container
 * Use VStack/HStack for common cases
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = "vertical",
      gap = 4,
      align = "stretch",
      justify = "start",
      wrap = false,
      fullWidth = false,
      fullHeight = false,
      className,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const gapValue = spacing[gap as keyof typeof spacing] || spacing[4];

    return (
      <Box
        ref={ref}
        className={cx(stackBase, className)}
        style={{
          flexDirection: direction === "vertical" ? "column" : "row",
          gap: gapValue,
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? "wrap" : "nowrap",
          width: fullWidth ? "100%" : undefined,
          height: fullHeight ? "100%" : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  },
);

Stack.displayName = "Stack";

/**
 * VStack - Vertical Stack
 * Convenience component for vertical layouts
 */
export const VStack = forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  (props, ref) => {
    return <Stack ref={ref} direction="vertical" {...props} />;
  },
);

VStack.displayName = "VStack";

/**
 * HStack - Horizontal Stack
 * Convenience component for horizontal layouts
 */
export const HStack = forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  (props, ref) => {
    return <Stack ref={ref} direction="horizontal" {...props} />;
  },
);

HStack.displayName = "HStack";
