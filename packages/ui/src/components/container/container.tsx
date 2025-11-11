"use client";

import { spacing } from "@httpjpg/tokens";
import { css, cx } from "@linaria/core";
import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Box } from "../box/box";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Container content
   */
  children: ReactNode;
  /**
   * Container size preset
   * @default "lg"
   */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "fluid";
  /**
   * Horizontal padding (using token scale)
   * @default 4
   */
  px?: keyof typeof spacing;
  /**
   * Vertical padding (using token scale)
   * @default 0
   */
  py?: keyof typeof spacing;
  /**
   * Center the container
   * @default true
   */
  center?: boolean;
}

const containerBase = css`
  box-sizing: border-box;
  width: 100%;
`;

const sizeMap = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  fluid: "100%",
};

/**
 * Container component - Max-width wrapper
 * Perfect for centered content layouts
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      size = "lg",
      px = 4,
      py = 0,
      center = true,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const paddingX = spacing[px as keyof typeof spacing] || spacing[4];
    const paddingY = spacing[py as keyof typeof spacing] || spacing[0];

    return (
      <Box
        ref={ref}
        className={cx(containerBase, className)}
        style={{
          maxWidth: sizeMap[size],
          paddingLeft: paddingX,
          paddingRight: paddingX,
          paddingTop: paddingY,
          paddingBottom: paddingY,
          marginLeft: center ? "auto" : undefined,
          marginRight: center ? "auto" : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </Box>
    );
  },
);

Container.displayName = "Container";
