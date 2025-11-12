"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Stack direction
   * @default "vertical"
   */
  direction?: "vertical" | "horizontal";
  /**
   * Spacing between items (Panda spacing token)
   * @default "4"
   */
  gap?: string | number;
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
  /**
   * Additional Panda CSS styles
   */
  css?: SystemStyleObject;
}

/**
 * Stack component - Flexible layout container
 *
 * Flexbox-based layout component with token-based gap and full alignment control.
 * Use VStack/HStack for common cases.
 *
 * @example
 * ```tsx
 * <Stack direction="vertical" gap={4} align="stretch">
 *   <Box>Item 1</Box>
 *   <Box>Item 2</Box>
 * </Stack>
 *
 * // Horizontal with space-between
 * <Stack direction="horizontal" gap={2} justify="space-between" fullWidth>
 *   <Button>Left</Button>
 *   <Button>Right</Button>
 * </Stack>
 *
 * // Wrapping stack
 * <Stack direction="horizontal" wrap gap={4}>
 *   {items.map(item => <Box key={item.id}>{item.content}</Box>)}
 * </Stack>
 * ```
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = "vertical",
      gap = "4",
      align = "stretch",
      justify = "start",
      wrap = false,
      fullWidth = false,
      fullHeight = false,
      className,
      children,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    return (
      <Box
        ref={ref}
        className={className}
        css={{
          display: "flex",
          flexDirection: direction === "vertical" ? "column" : "row",
          gap,
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? "wrap" : "nowrap",
          w: fullWidth ? "full" : undefined,
          h: fullHeight ? "full" : undefined,
          ...cssProp,
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
 *
 * Convenience component for vertical flexbox layouts.
 *
 * @example
 * ```tsx
 * <VStack gap={6} alignItems="stretch">
 *   <Headline>Title</Headline>
 *   <Paragraph>Content</Paragraph>
 * </VStack>
 * ```
 */
export const VStack = forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  (props, ref) => {
    return <Stack ref={ref} direction="vertical" {...props} />;
  },
);

VStack.displayName = "VStack";

/**
 * HStack - Horizontal Stack
 *
 * Convenience component for horizontal flexbox layouts.
 *
 * @example
 * ```tsx
 * <HStack gap={4} justifyContent="space-between">
 *   <Button>Left</Button>
 *   <Button>Right</Button>
 * </HStack>
 * ```
 */
export const HStack = forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  (props, ref) => {
    return <Stack ref={ref} direction="horizontal" {...props} />;
  },
);

HStack.displayName = "HStack";
