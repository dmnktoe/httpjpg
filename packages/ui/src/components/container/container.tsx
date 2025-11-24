"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

const sizeMap = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  fluid: "100%",
} as const;

export interface ContainerProps
  extends Omit<ComponentPropsWithoutRef<"div">, "css"> {
  /**
   * Container content
   */
  children: ReactNode;
  /**
   * Container size preset
   * @default "lg"
   */
  size?: keyof typeof sizeMap;
  /**
   * Horizontal padding (using Panda spacing tokens: 0-96)
   * @default "4"
   */
  px?: string | number;
  /**
   * Vertical padding (using Panda spacing tokens: 0-96)
   * @default "0"
   */
  py?: string | number;
  /**
   * Center the container
   * @default true
   */
  center?: boolean;
  /**
   * CSS styles using Panda CSS style object
   */
  css?: SystemStyleObject;
}

/**
 * Container component - Max-width wrapper built on Box
 *
 * Responsive container with centered content and configurable max-width breakpoints.
 * Uses the Box component under the hood with full Panda CSS style prop support.
 * Perfect for page layouts and content sections with token-based padding control.
 *
 * @example
 * ```tsx
 * <Container size="lg" px={4}>
 *   <Headline>Content</Headline>
 * </Container>
 *
 * // Fluid container without max-width
 * <Container size="fluid" px={8} py={4}>
 *   Full-width content
 * </Container>
 *
 * // Non-centered container with custom styles
 * <Container size="md" center={false} css={{ bg: "neutral.50" }}>
 *   Left-aligned content
 * </Container>
 * ```
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      size = "lg",
      px = "4",
      py = "0",
      center = true,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        style={{
          width: "100%",
          paddingLeft: "1rem",
          paddingRight: "1rem",
        }}
        {...props}
      >
        <Box
          css={{
            maxWidth: sizeMap[size],
            marginLeft: center ? "auto" : "0",
            marginRight: center ? "auto" : "0",
            px,
            py,
            ...cssProp,
          }}
        >
          {children}
        </Box>
      </div>
    );
  },
);

Container.displayName = "Container";
