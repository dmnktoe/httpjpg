"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export interface CenterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "css"> {
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
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
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
          boxSizing: "border-box",
          display: useFlex ? "flex" : "grid",
          justifyContent: useFlex && horizontal ? "center" : undefined,
          justifyItems: !useFlex && horizontal ? "center" : undefined,
          alignItems: vertical ? "center" : undefined,
          minH: minHeight,
          ...cssProp,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  },
);

Center.displayName = "Center";
