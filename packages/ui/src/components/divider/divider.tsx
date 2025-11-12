"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { Box } from "../box/box";

export interface DividerProps
  extends Omit<ComponentPropsWithoutRef<"div">, "css"> {
  /**
   * Divider orientation
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Divider variant/style
   * @default "solid"
   */
  variant?: "solid" | "dashed" | "dotted" | "ascii" | "custom";
  /**
   * ASCII pattern or custom content for divider
   * @example "*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚"
   */
  pattern?: string;
  /**
   * Custom content (renders instead of line)
   */
  children?: ReactNode;
  /**
   * Divider thickness (for solid/dashed/dotted variants)
   * @default "1px"
   */
  thickness?: string;
  /**
   * Divider color (Panda color token)
   * @default "neutral.300"
   */
  color?: string;
  /**
   * Spacing around divider (using Panda spacing tokens: 0-96)
   * @default "4"
   */
  spacing?: string | number;
  /**
   * CSS styles using Panda CSS style object
   */
  css?: SystemStyleObject;
}

/**
 * Divider component - Visual separator with ASCII art support built on Box
 *
 * Perfect for brutalist design with support for ASCII patterns,
 * custom content, or traditional lines. Embraces the aesthetic of
 * overlapping text and decorative separators. Uses Panda CSS for styling.
 *
 * @example
 * ```tsx
 * // ASCII art divider (brutalist style)
 * <Divider variant="ascii" pattern="*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚" />
 *
 * // Custom content divider
 * <Divider>→ SECTION BREAK ←</Divider>
 *
 * // Traditional solid line
 * <Divider variant="solid" />
 *
 * // Thick dashed divider with custom color
 * <Divider variant="dashed" thickness="3px" color="primary.500" />
 * ```
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = "horizontal",
      variant = "solid",
      pattern = "*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚",
      children,
      thickness = "1px",
      color: dividerColor = "neutral.300",
      spacing: dividerSpacing = "4",
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    // ASCII or custom content divider
    if (variant === "ascii" || variant === "custom" || children) {
      return (
        <Box
          ref={ref}
          css={{
            m: 0,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "mono",
            fontWeight: 400,
            letterSpacing: "0.05em",
            userSelect: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: dividerColor,
            w: orientation === "horizontal" ? "full" : undefined,
            mt: orientation === "horizontal" ? dividerSpacing : undefined,
            mb: orientation === "horizontal" ? dividerSpacing : undefined,
            textAlign: orientation === "horizontal" ? "center" : undefined,
            writingMode: orientation === "vertical" ? "vertical-rl" : undefined,
            h: orientation === "vertical" ? "full" : undefined,
            minH: orientation === "vertical" ? "100px" : undefined,
            ml: orientation === "vertical" ? dividerSpacing : undefined,
            mr: orientation === "vertical" ? dividerSpacing : undefined,
            ...cssProp,
          }}
          {...props}
        >
          {children || pattern}
        </Box>
      );
    }

    // Traditional line divider
    const borderStyle =
      variant === "dashed"
        ? "dashed"
        : variant === "dotted"
          ? "dotted"
          : "solid";

    return (
      <Box
        ref={ref}
        css={{
          m: 0,
          flexShrink: 0,
          w: orientation === "horizontal" ? "full" : undefined,
          h: orientation === "horizontal" ? undefined : "full",
          minH: orientation === "vertical" ? "20px" : undefined,
          borderTopStyle:
            orientation === "horizontal" ? borderStyle : undefined,
          borderTopColor:
            orientation === "horizontal" ? dividerColor : undefined,
          borderLeftStyle: orientation === "vertical" ? borderStyle : undefined,
          borderLeftColor:
            orientation === "vertical" ? dividerColor : undefined,
          mt: orientation === "horizontal" ? dividerSpacing : undefined,
          mb: orientation === "horizontal" ? dividerSpacing : undefined,
          ml: orientation === "vertical" ? dividerSpacing : undefined,
          mr: orientation === "vertical" ? dividerSpacing : undefined,
          ...cssProp,
        }}
        style={{
          // thickness must be inline style - it's a dynamic CSS value
          width: orientation === "vertical" ? thickness : undefined,
          height: orientation === "horizontal" ? thickness : undefined,
          borderTopWidth: orientation === "horizontal" ? thickness : undefined,
          borderLeftWidth: orientation === "vertical" ? thickness : undefined,
        }}
        {...props}
      />
    );
  },
);

Divider.displayName = "Divider";
