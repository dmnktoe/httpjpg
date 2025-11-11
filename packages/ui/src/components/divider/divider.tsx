"use client";

import { colors, spacing, typography } from "@httpjpg/tokens";
import { css, cx } from "@linaria/core";
import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Box } from "../box/box";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
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
  thickness?: "1px" | "2px" | "3px" | "4px";
  /**
   * Divider color
   * @default "neutral.300"
   */
  color?: string;
  /**
   * Spacing around divider (using token scale)
   * @default 4
   */
  spacing?: keyof typeof spacing;
}

const dividerBase = css`
  box-sizing: border-box;
  margin: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const asciiPattern = css`
  font-family: ${typography.fontFamily.mono.join(", ")};
  font-weight: 400;
  letter-spacing: 0.05em;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * Divider component - Visual separator with ASCII art support
 *
 * Perfect for brutalist design with support for ASCII patterns,
 * custom content, or traditional lines. Embraces the aesthetic of
 * overlapping text and decorative separators.
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
      color: dividerColor = colors.neutral[300],
      spacing: dividerSpacing = 4,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const spacingValue =
      spacing[dividerSpacing as keyof typeof spacing] || spacing[4];

    // ASCII or custom content divider
    if (variant === "ascii" || variant === "custom" || children) {
      return (
        <Box
          ref={ref}
          className={cx(dividerBase, asciiPattern, className)}
          style={{
            color: dividerColor,
            width: orientation === "horizontal" ? "100%" : undefined,
            marginTop: orientation === "horizontal" ? spacingValue : undefined,
            marginBottom:
              orientation === "horizontal" ? spacingValue : undefined,
            textAlign: orientation === "horizontal" ? "center" : undefined,
            writingMode: orientation === "vertical" ? "vertical-rl" : undefined,
            textOrientation: orientation === "vertical" ? "mixed" : undefined,
            height: orientation === "vertical" ? "100%" : undefined,
            minHeight: orientation === "vertical" ? "100px" : undefined,
            marginLeft: orientation === "vertical" ? spacingValue : undefined,
            marginRight: orientation === "vertical" ? spacingValue : undefined,
            ...style,
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
        className={cx(dividerBase, className)}
        style={{
          width: orientation === "horizontal" ? "100%" : thickness,
          height: orientation === "horizontal" ? thickness : "100%",
          minHeight: orientation === "vertical" ? "20px" : undefined,
          border: "none",
          borderTop:
            orientation === "horizontal"
              ? `${thickness} ${borderStyle} ${dividerColor}`
              : undefined,
          borderLeft:
            orientation === "vertical"
              ? `${thickness} ${borderStyle} ${dividerColor}`
              : undefined,
          marginTop: orientation === "horizontal" ? spacingValue : undefined,
          marginBottom: orientation === "horizontal" ? spacingValue : undefined,
          marginLeft: orientation === "vertical" ? spacingValue : undefined,
          marginRight: orientation === "vertical" ? spacingValue : undefined,
          ...style,
        }}
        {...props}
      />
    );
  },
);

Divider.displayName = "Divider";
