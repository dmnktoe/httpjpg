"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface ParagraphProps
  extends Omit<HTMLAttributes<HTMLParagraphElement>, "css"> {
  /**
   * Visual size variant
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Text alignment
   * @default "left"
   */
  align?: "left" | "center" | "right";
  /**
   * Paragraph content
   */
  children: ReactNode;
  /**
   * Maximum width for optimal reading (approx. 60-75 characters)
   * @default true
   */
  maxWidth?: boolean;
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
    fontWeight: 400,
    color: "neutral.700",

    /* Optimal line height for readability */
    lineHeight: 1.75,

    /* Prevent orphans */
    textWrap: "pretty",
  },
  variants: {
    size: {
      sm: {
        fontSize: "0.75rem",
        lineHeight: 1.75,
      },
      md: {
        fontSize: "1rem",
        lineHeight: 1.75,
      },
      lg: {
        fontSize: "1.125rem",
        lineHeight: 1.8,
      },
    },
    align: {
      left: {
        textAlign: "left",
      },
      center: {
        textAlign: "center",
      },
      right: {
        textAlign: "right",
      },
    },
    maxWidth: {
      true: {
        /* Optimal reading width: ~60-75 characters per line */
        maxWidth: "65ch",
      },
    },
  },
  defaultVariants: {
    size: "sm",
    align: "left",
    maxWidth: true,
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
 * // Small paragraph without max width constraint
 * <Paragraph size="sm" maxWidth={false}>
 *   This is a small paragraph that can span the full container width.
 * </Paragraph>
 * ```
 */
export function Paragraph({
  size = "md",
  align = "left",
  maxWidth = true,
  children,
  className,
  css: cssProp,
  ...props
}: ParagraphProps) {
  const styles = cx(
    css(paragraphRecipe.raw({ size, align, maxWidth })),
    cssProp && css(cssProp),
    className,
  );

  return (
    <p className={styles} {...props}>
      {children}
    </p>
  );
}
