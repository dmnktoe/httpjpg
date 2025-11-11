"use client";

import { spacing } from "@httpjpg/tokens";
import { css, cx } from "@linaria/core";
import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /**
   * Section content
   */
  children: ReactNode;
  /**
   * Padding top (using token scale)
   * @default 16
   */
  pt?: keyof typeof spacing;
  /**
   * Padding bottom (using token scale)
   * @default 16
   */
  pb?: keyof typeof spacing;
  /**
   * Padding left (using token scale)
   * @default 0
   */
  pl?: keyof typeof spacing;
  /**
   * Padding right (using token scale)
   * @default 0
   */
  pr?: keyof typeof spacing;
  /**
   * Full width
   * @default true
   */
  fullWidth?: boolean;
}

const sectionBase = css`
  box-sizing: border-box;
`;

/**
 * Section component - Semantic section wrapper
 * Perfect for organizing portfolio content with consistent spacing
 */
export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      pt = 16,
      pb = 16,
      pl = 0,
      pr = 0,
      fullWidth = true,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const paddingTop = spacing[pt as keyof typeof spacing] || spacing[16];
    const paddingBottom = spacing[pb as keyof typeof spacing] || spacing[16];
    const paddingLeft = spacing[pl as keyof typeof spacing] || spacing[0];
    const paddingRight = spacing[pr as keyof typeof spacing] || spacing[0];

    return (
      <section
        ref={ref}
        className={cx(sectionBase, className)}
        style={{
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
          width: fullWidth ? "100%" : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </section>
    );
  },
);

Section.displayName = "Section";
