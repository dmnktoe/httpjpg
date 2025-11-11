"use client";

import { css, cx } from "@linaria/core";
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

const centerBase = css`
  box-sizing: border-box;
`;

/**
 * Center component - Center content horizontally and/or vertically
 * Perfect for hero sections and centered layouts
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
        className={cx(centerBase, className)}
        style={{
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
