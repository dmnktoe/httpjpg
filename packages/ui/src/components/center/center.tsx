"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Box } from "../box/box";

export interface CenterProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Center content
   */
  children: ReactNode;
  /**
   * Center horizontally
   * @default true
   */
  horizontal?: boolean;
  /**
   * Center vertically
   * @default true
   */
  vertical?: boolean;
  /**
   * Use flexbox instead of grid
   * @default false
   */
  useFlex?: boolean;
  /**
   * Minimum height (for vertical centering)
   * @default "auto"
   */
  minHeight?: string;
}

/**
 * Center component - Center content horizontally and/or vertically
 *
 * Flexible centering component with control over horizontal/vertical centering
 * and choice between flexbox or grid layout.
 *
 * Perfect for hero sections and centered layouts.
 *
 * @example
 * ```tsx
 * <Center minHeight="100vh">
 *   <Headline>Centered Content</Headline>
 * </Center>
 *
 * // Only horizontal centering
 * <Center vertical={false}>
 *   Content
 * </Center>
 *
 * // Using grid layout
 * <Center useFlex={false} minHeight="50vh">
 *   Grid centered content
 * </Center>
 * ```
 */
export const Center = forwardRef<HTMLDivElement, CenterProps>(
  (
    {
      children,
      horizontal = true,
      vertical = true,
      useFlex = false,
      minHeight = "auto",
      className,
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <Box
        ref={ref}
        className={className}
        style={{
          boxSizing: "border-box",
          display: useFlex ? "flex" : "grid",
          justifyContent: useFlex && horizontal ? "center" : undefined,
          justifyItems: !useFlex && horizontal ? "center" : undefined,
          alignItems: vertical ? "center" : undefined,
          minHeight,
          ...style,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  },
);

Center.displayName = "Center";
