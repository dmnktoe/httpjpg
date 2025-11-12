"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface HeadlineProps
  extends Omit<HTMLAttributes<HTMLHeadingElement>, "css"> {
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
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

const headlineRecipe = cva({
  base: {
    /* Reset & Base */
    margin: 0,
    padding: 0,

    /* Typography */
    fontFamily: "sans",
    fontWeight: 700,
    color: "black",
    letterSpacing: "-0.025em",

    /* Prevent text wrapping issues */
    textWrap: "balance",
  },
  variants: {
    level: {
      1: {
        /* Level 1: Hero/Page Title */
        fontSize: "clamp(2.25rem, 5vw + 1rem, 3.75rem)",
        lineHeight: 1.1,
        fontWeight: 900,
        letterSpacing: "-0.035em",

        md: {
          lineHeight: 1,
        },
      },
      2: {
        /* Level 2: Section Title */
        fontSize: "clamp(1.875rem, 4vw + 1rem, 3rem)",
        lineHeight: 1.2,
        fontWeight: 800,
        letterSpacing: "-0.03em",

        md: {
          lineHeight: 1.1,
        },
      },
      3: {
        /* Level 3: Subsection Title */
        fontSize: "clamp(1.5rem, 3vw + 0.5rem, 2.25rem)",
        lineHeight: 1.3,
        fontWeight: 700,

        md: {
          lineHeight: 1.2,
        },
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
  className,
  css: cssProp,
  ...props
}: HeadlineProps) {
  const element = as ?? getDefaultElement(level);
  const Element = element;

  const styles = cx(
    headlineRecipe({ level }),
    cssProp && css(cssProp),
    className,
  );

  return (
    <Element className={styles} {...props}>
      {children}
    </Element>
  );
}
