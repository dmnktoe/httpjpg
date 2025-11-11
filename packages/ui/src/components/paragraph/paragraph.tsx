import { colors, typography } from "@httpjpg/tokens";
import { css, cx } from "@linaria/core";
import type { HTMLAttributes, ReactNode } from "react";

export interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
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
}

const paragraphBase = css`
  /* Reset & Base */
  margin: 0;
  padding: 0;

  /* Typography */
  font-family: ${typography.fontFamily.sans.join(", ")};
  font-weight: 400;
  color: ${colors.neutral[700]};

  /* Optimal line height for readability */
  line-height: 1.75;

  /* Prevent orphans */
  text-wrap: pretty;
`;

const sizeSm = css`
  font-size: 0.875rem;
  line-height: 1.65;

  @media (min-width: 768px) {
    font-size: 0.9375rem;
  }
`;

const sizeMd = css`
  font-size: 1rem;
  line-height: 1.75;

  @media (min-width: 768px) {
    font-size: 1.0625rem;
  }
`;

const sizeLg = css`
  font-size: 1.125rem;
  line-height: 1.8;

  @media (min-width: 768px) {
    font-size: 1.25rem;
    line-height: 1.85;
  }
`;

const alignLeft = css`
  text-align: left;
`;

const alignCenter = css`
  text-align: center;
`;

const alignRight = css`
  text-align: right;
`;

const withMaxWidth = css`
  /* Optimal reading width: ~60-75 characters per line */
  max-width: 65ch;
`;

/**
 * A responsive paragraph component for body text with optimal typography.
 *
 * Features responsive font sizing, optimal line height for readability,
 * optional max-width constraint for comfortable reading, and text wrapping
 * optimization. Uses zero-runtime CSS-in-JS via Linaria for optimal performance.
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
  ...props
}: ParagraphProps) {
  const sizeClass = size === "sm" ? sizeSm : size === "lg" ? sizeLg : sizeMd;
  const alignClass =
    align === "center"
      ? alignCenter
      : align === "right"
        ? alignRight
        : alignLeft;

  return (
    <p
      className={cx(
        paragraphBase,
        sizeClass,
        alignClass,
        maxWidth && withMaxWidth,
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
