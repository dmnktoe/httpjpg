"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface HeadlineProps
  extends Omit<HTMLAttributes<HTMLHeadingElement>, "css" | "style"> {
  /**
   * Semantic heading level (affects sizing)
   * @default 1
   */
  level?: 1 | 2 | 3;
  /**
   * Headline content
   */
  children: ReactNode;
  /**
   * Override the HTML element (for semantic flexibility)
   * @default Matches level (h1, h2, h3)
   */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /**
   * Top margin spacing token
   * @default undefined
   */
  marginTop?: string;
  /**
   * Bottom margin spacing token
   * @default undefined
   */
  marginBottom?: string;
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
  /**
   * Inline styles (fontSize is automatically set via clamp())
   */
  style?: React.CSSProperties;
}

// Fluid typography with clamp() - must match staticCss values exactly
const HEADLINE_FONT_SIZES = {
  1: "clamp(2.25rem, 5vw + 1rem, 3.75rem)" as const,
  2: "clamp(1.875rem, 4vw + 1rem, 3rem)" as const,
  3: "clamp(1.5rem, 3vw + 0.5rem, 2.25rem)" as const,
};

const headlineRecipe = cva({
  base: {
    /* Reset & Base */
    margin: 0,
    padding: 0,

    /* Typography */
    fontFamily: "headline",
    fontWeight: "bold", // token: typography.fontWeight.bold (700)
    letterSpacing: "tight", // token: typography.letterSpacing.tight (-0.025em)
    lineHeight: 1, // Tight line-height for all headlines

    /* Prevent text wrapping issues */
    textWrap: "balance",
  },
  variants: {
    level: {
      1: {
        /* Level 1: Hero/Page Title */
        fontSize: HEADLINE_FONT_SIZES[1],
        fontWeight: "black", // token: typography.fontWeight.black (900)
        letterSpacing: "tighter", // token: typography.letterSpacing.tighter (-0.05em ~ -0.035em)
      },
      2: {
        /* Level 2: Section Title */
        fontSize: HEADLINE_FONT_SIZES[2],
        fontWeight: "extrabold", // token: typography.fontWeight.extrabold (800)
        letterSpacing: "tighter", // token: typography.letterSpacing.tighter (-0.05em ~ -0.03em)
      },
      3: {
        /* Level 3: Subsection Title */
        fontSize: HEADLINE_FONT_SIZES[3],
        fontWeight: "bold", // token: typography.fontWeight.bold (700)
      },
    },
  },
  defaultVariants: {
    level: 1,
  },
});

const getDefaultElement = (level: 1 | 2 | 3): "h1" | "h2" | "h3" => {
  return `h${level}` as "h1" | "h2" | "h3";
};

/**
 * A responsive headline component with semantic HTML and fluid typography.
 *
 * Features responsive font sizing using CSS clamp(), balanced text wrapping,
 * and polymorphic rendering for semantic flexibility. Uses Panda CSS for
 * zero-runtime styling with type-safe design tokens.
 *
 * @example
 * ```tsx
 * // Default behavior: h1 element with level 1 styling
 * <Headline>Page Title</Headline>
 *
 * // Level 2 styling with h2 element
 * <Headline level={2}>Section Title</Headline>
 *
 * // Level 1 styling but h2 element (for SEO)
 * <Headline level={1} as="h2">Visual h1, Semantic h2</Headline>
 * ```
 */
export function Headline({
  level = 1,
  children,
  as,
  marginTop,
  marginBottom,
  className,
  css: cssProp,
  style,
  ...props
}: HeadlineProps) {
  const element = as ?? getDefaultElement(level);
  const Element = element;

  const styles = cx(
    headlineRecipe({ level }),
    (marginTop || marginBottom) &&
      css({
        ...(marginTop && { mt: marginTop }),
        ...(marginBottom && { mb: marginBottom }),
      }),
    cssProp && css(cssProp),
    className,
  );

  return (
    <Element className={styles} style={style} {...props}>
      {children}
    </Element>
  );
}
