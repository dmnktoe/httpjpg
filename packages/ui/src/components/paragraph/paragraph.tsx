"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface ParagraphProps
  extends Omit<ComponentPropsWithoutRef<"p">, "css"> {
  /**
   * Render as different HTML element
   * @default "p"
   */
  as?: ElementType;
  /**
   * Visual size variant
   * @default "sm"
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Text alignment
   * @default "left"
   */
  align?: "left" | "center" | "right" | "justify";
  /**
   * Paragraph content
   */
  children: ReactNode;
  /**
   * Maximum width for optimal reading (approx. 60-75 characters)
   * Can be boolean, named preset, or custom ch value
   * @default false
   */
  maxWidth?: boolean | "narrow" | "readable" | "wide" | "extra-wide" | string;
  /**
   * Add bottom spacing for multiple paragraphs
   * @default false
   */
  spacing?: boolean;
  /**
   * Text color variant
   * @default "default"
   */
  color?: "default" | "muted" | "dimmed";
  /**
   * Font weight
   * @default "normal"
   */
  weight?: "normal" | "medium" | "semibold";
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

const paragraphRecipe = cva({
  base: {
    /* Reset & Base */
    margin: 0,
    padding: 0,

    /* Typography */
    fontFamily: "sans",

    /* Optimal line height for readability */
    lineHeight: 1.75,

    /* Prevent orphans */
    textWrap: "pretty",
  },
  variants: {
    size: {
      sm: {
        fontSize: "sm", // 12px - token: fontSizes.sm
        lineHeight: 1.75,
      },
      md: {
        fontSize: "md", // 14px - token: fontSizes.md
        lineHeight: 1.75,
      },
      lg: {
        fontSize: "lg", // 16px - token: fontSizes.lg
        lineHeight: 1.8,
      },
      xl: {
        fontSize: "xl", // 18px - token: fontSizes.xl
        lineHeight: 1.8,
      },
    },
    align: {
      left: {
        textAlign: "left",
      },
      center: {
        textAlign: "center",
        marginLeft: "auto",
        marginRight: "auto",
      },
      right: {
        textAlign: "right",
        marginLeft: "auto",
      },
      justify: {
        textAlign: "justify",
        textJustify: "inter-word",
      },
    },
    color: {
      default: {
        color: "black",
        opacity: 1,
      },
      muted: {
        color: "black",
        opacity: 0.7,
      },
      dimmed: {
        color: "black",
        opacity: 0.5,
      },
    },
    weight: {
      normal: {
        fontWeight: 400,
      },
      medium: {
        fontWeight: 500,
      },
      semibold: {
        fontWeight: 600,
      },
    },
    spacing: {
      true: {
        /* Bottom spacing for multiple paragraphs */
        marginBottom: 4,
      },
    },
  },
  defaultVariants: {
    size: "sm",
    align: "left",
    color: "default",
    weight: "normal",
    spacing: false,
  },
});

/**
 * A responsive paragraph component for body text with optimal typography.
 *
 * Features responsive font sizing, optimal line height for readability,
 * optional max-width constraint for comfortable reading, and text wrapping
 * optimization. Uses Panda CSS for zero-runtime styling with type-safe design tokens.
 *
 * @example
 * ```tsx
 * // Default paragraph (medium size, left aligned)
 * <Paragraph>
 *   This is a default paragraph with optimal typography settings.
 * </Paragraph>
 *
 * // Large centered paragraph with max width
 * <Paragraph size="lg" align="center" maxWidth>
 *   This is a large centered paragraph with constrained width for readability.
 * </Paragraph>
 *
 * // Custom max width
 * <Paragraph maxWidth="80ch">
 *   Wide paragraph with 80 character max width.
 * </Paragraph>
 *
 * // As different element with custom styling
 * <Paragraph as="span" size="sm" color="muted" weight="medium">
 *   This renders as a span with custom styling.
 * </Paragraph>
 * ```
 */
export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      as: Component = "p",
      size = "sm",
      align = "left",
      color = "default",
      weight = "normal",
      maxWidth = false,
      spacing = false,
      children,
      className,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    const maxWidthValue =
      maxWidth === "narrow"
        ? "45ch"
        : maxWidth === "readable"
          ? "65ch"
          : maxWidth === "wide"
            ? "80ch"
            : maxWidth === "extra-wide"
              ? "100ch"
              : typeof maxWidth === "string"
                ? maxWidth
                : maxWidth === true
                  ? "65ch"
                  : undefined;

    const styles = cx(
      css(paragraphRecipe.raw({ size, align, color, weight, spacing })),
      maxWidthValue && css({ maxWidth: maxWidthValue }),
      className,
      cssProp && css(cssProp),
    );

    return (
      <Component ref={ref} className={styles} {...props}>
        {children}
      </Component>
    );
  },
);

Paragraph.displayName = "Paragraph";
