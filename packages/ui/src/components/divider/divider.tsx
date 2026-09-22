"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { token } from "styled-system/tokens";
import type { SystemStyleObject } from "styled-system/types";

import {
  ASCII_DIVIDER_ARROWS,
  ASCII_DIVIDER_DOTS,
  ASCII_DIVIDER_STARS,
  ASCII_DIVIDER_WAVE,
  ASCII_SPARKLES,
} from "../ascii-art/banners";
import { Box } from "../box/box";

export type DividerPreset = "stars" | "dots" | "wave" | "arrows" | "sparkles";

const PRESETS: Record<DividerPreset, string> = {
  stars: ASCII_DIVIDER_STARS,
  dots: ASCII_DIVIDER_DOTS,
  wave: ASCII_DIVIDER_WAVE,
  arrows: ASCII_DIVIDER_ARROWS,
  sparkles: ASCII_SPARKLES,
};

export interface DividerProps extends Omit<ComponentPropsWithoutRef<"div">, "css"> {
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed" | "dotted" | "ascii" | "custom";
  /** Shorthand for picking one of the built-in ASCII patterns. */
  preset?: DividerPreset;
  /** Explicit pattern; overrides `preset`. */
  pattern?: string;
  children?: ReactNode;
  thickness?: string;
  /**
   * Panda token path (`"neutral.300"`) or a raw CSS color.
   * Storyblok `color-options` emit hex — those must pass through as-is.
   */
  color?: string;
  spacing?: string | number;
  css?: SystemStyleObject;
}

/** Resolve a token path via Panda; leave hex / rgb / var() alone for the CMS. */
function resolveDividerColor(color: string): string {
  if (
    color.startsWith("#") ||
    color.startsWith("rgb") ||
    color.startsWith("hsl") ||
    color.startsWith("var(")
  ) {
    return color;
  }
  const fromToken = token(`colors.${color}` as never) as string | undefined;
  return fromToken ?? color;
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = "horizontal",
      variant = "solid",
      preset,
      pattern,
      children,
      thickness = "1px",
      color: dividerColor = "neutral.300",
      spacing: dividerSpacing = "4",
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    const resolvedColor = resolveDividerColor(dividerColor);
    const horizontal = orientation === "horizontal";
    const resolvedPattern = pattern ?? (preset ? PRESETS[preset] : ASCII_DIVIDER_STARS);

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
            letterSpacing: "wider",
            userSelect: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            w: horizontal ? "full" : undefined,
            mt: horizontal ? dividerSpacing : undefined,
            mb: horizontal ? dividerSpacing : undefined,
            textAlign: horizontal ? "center" : undefined,
            writingMode: horizontal ? undefined : "vertical-rl",
            h: horizontal ? undefined : "full",
            minH: horizontal ? undefined : "100px",
            ml: horizontal ? undefined : dividerSpacing,
            mr: horizontal ? undefined : dividerSpacing,
            ...cssProp,
          }}
          style={{ color: resolvedColor }}
          {...props}
        >
          {children || resolvedPattern}
        </Box>
      );
    }

    const borderStyle = variant === "dashed" ? "dashed" : variant === "dotted" ? "dotted" : "solid";

    return (
      <Box
        ref={ref}
        css={{
          m: 0,
          flexShrink: 0,
          w: horizontal ? "full" : undefined,
          h: horizontal ? undefined : "full",
          minH: horizontal ? undefined : "20px",
          mt: horizontal ? dividerSpacing : undefined,
          mb: horizontal ? dividerSpacing : undefined,
          ml: horizontal ? undefined : dividerSpacing,
          mr: horizontal ? undefined : dividerSpacing,
          ...cssProp,
        }}
        style={{
          borderTopWidth: horizontal ? thickness : undefined,
          borderTopStyle: horizontal ? borderStyle : undefined,
          borderTopColor: horizontal ? resolvedColor : undefined,
          borderLeftWidth: horizontal ? undefined : thickness,
          borderLeftStyle: horizontal ? undefined : borderStyle,
          borderLeftColor: horizontal ? undefined : resolvedColor,
        }}
        {...props}
      />
    );
  },
);

Divider.displayName = "Divider";
