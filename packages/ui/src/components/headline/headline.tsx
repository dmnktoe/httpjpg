import { colors, typography } from "@httpjpg/tokens";
import { css, cx } from "@linaria/core";
import type { HTMLAttributes, ReactNode } from "react";

export interface HeadlineProps extends HTMLAttributes<HTMLHeadingElement> {
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
}

const headlineBase = css`
  /* Reset & Base */
  margin: 0;
  padding: 0;

  /* Typography */
  font-family: ${typography.fontFamily.sans.join(", ")};
  font-weight: 700;
  color: ${colors.black};
  letter-spacing: -0.025em;

  /* Prevent text wrapping issues */
  text-wrap: balance;
`;

const level1 = css`
  /* Level 1: Hero/Page Title */
  font-size: clamp(2.25rem, 5vw + 1rem, 3.75rem);
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: -0.035em;

  @media (min-width: 768px) {
    line-height: 1;
  }
`;

const level2 = css`
  /* Level 2: Section Title */
  font-size: clamp(1.875rem, 4vw + 1rem, 3rem);
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.03em;

  @media (min-width: 768px) {
    line-height: 1.1;
  }
`;

const level3 = css`
  /* Level 3: Subsection Title */
  font-size: clamp(1.5rem, 3vw + 0.5rem, 2.25rem);
  line-height: 1.3;
  font-weight: 700;

  @media (min-width: 768px) {
    line-height: 1.2;
  }
`;

const getDefaultElement = (level: 1 | 2 | 3): "h1" | "h2" | "h3" => {
  return `h${level}` as "h1" | "h2" | "h3";
};

/**
 * A responsive headline component with semantic HTML and fluid typography.
 *
 * Features responsive font sizing using CSS clamp(), balanced text wrapping,
 * and polymorphic rendering for semantic flexibility. Uses zero-runtime CSS-in-JS
 * via Linaria for optimal performance.
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
  ...props
}: HeadlineProps) {
  const element = as ?? getDefaultElement(level);
  const levelClass = level === 2 ? level2 : level === 3 ? level3 : level1;

  const Element = element;

  return (
    <Element className={cx(headlineBase, levelClass, className)} {...props}>
      {children}
    </Element>
  );
}
