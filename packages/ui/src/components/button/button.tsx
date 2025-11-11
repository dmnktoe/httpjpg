"use client";

import { borderRadius, colors, spacing, typography } from "@httpjpg/tokens";
import { css, cx } from "@linaria/core";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "outline";
  /**
   * Button size
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Button content
   */
  children: ReactNode;
}

const buttonBase = css`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: ${borderRadius.xl};
  font-family: ${typography.fontFamily.sans.join(", ")};
  font-weight: 600;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0));
    -webkit-mask: linear-gradient(${colors.white} 0 0) content-box, linear-gradient(${colors.white} 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover::before {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: ${spacing[2]};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    filter: grayscale(0.5);
  }

  &:active:not(:disabled) {
    transform: scale(0.97) translateY(1px);
  }
`;

const variantPrimary = css`
  background: linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%);
  color: ${colors.white};
  border: 2px solid ${colors.primary[700]};
  box-shadow:
    0 4px 14px rgba(244, 63, 94, 0.4),
    0 2px 6px rgba(244, 63, 94, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%);
    box-shadow:
      0 6px 20px rgba(244, 63, 94, 0.5),
      0 3px 8px rgba(244, 63, 94, 0.3),
      inset 0 -2px 4px rgba(0, 0, 0, 0.2),
      inset 0 1px 2px rgba(255, 255, 255, 0.3);
  }
`;

const variantSecondary = css`
  background: linear-gradient(135deg, ${colors.white} 0%, ${colors.neutral[100]} 100%);
  color: ${colors.neutral[950]};
  border: 2px solid ${colors.neutral[200]};
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.08),
    0 1px 4px rgba(0, 0, 0, 0.04),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${colors.neutral[50]} 0%, ${colors.neutral[200]} 100%);
    border-color: ${colors.neutral[300]};
    box-shadow:
      0 4px 14px rgba(0, 0, 0, 0.1),
      0 2px 6px rgba(0, 0, 0, 0.05),
      inset 0 1px 2px rgba(255, 255, 255, 0.9);
  }
`;

const variantOutline = css`
  background: rgba(255, 255, 255, 0.05);
  color: ${colors.neutral[950]};
  border: 2px solid ${colors.neutral[300]};
  backdrop-filter: blur(12px) saturate(180%);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 1px 2px rgba(255, 255, 255, 0.4);

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.04);
    border-color: ${colors.neutral[950]};
    backdrop-filter: blur(16px) saturate(200%);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.08),
      inset 0 1px 2px rgba(255, 255, 255, 0.5);
  }
`;

const sizeSm = css`
  font-size: 0.8125rem;
  padding: ${spacing[2]} ${spacing[4]};
  min-height: ${spacing[9]};
  line-height: 1.25;
`;

const sizeMd = css`
  font-size: 0.9375rem;
  padding: ${spacing[3]} ${spacing[7]};
  min-height: ${spacing[11]};
  line-height: 1.375;
`;

const sizeLg = css`
  font-size: 1.0625rem;
  padding: ${spacing[4]} ${spacing[9]};
  min-height: ${spacing[14]};
  line-height: 1.5;
`;

/**
 * A versatile button component with multiple variants, sizes, and accessibility features.
 *
 * Features glass morphism effects, smooth transitions, and comprehensive keyboard navigation
 * support. Uses zero-runtime CSS-in-JS via Linaria for optimal performance.
 *
 * @example
 * ```tsx
 * // Primary button (default)
 * <Button>Click me</Button>
 *
 * // Secondary variant with custom size
 * <Button variant="secondary" size="lg">Large Secondary</Button>
 *
 * // Outline variant with glass morphism
 * <Button variant="outline">Outline with Blur</Button>
 *
 * // Disabled state
 * <Button disabled>Disabled Button</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      children,
      type = "button",
      className,
      ...props
    },
    ref,
  ) {
    const variantClass =
      variant === "secondary"
        ? variantSecondary
        : variant === "outline"
          ? variantOutline
          : variantPrimary;

    const sizeClass = size === "sm" ? sizeSm : size === "lg" ? sizeLg : sizeMd;

    return (
      <button
        ref={ref}
        type={type}
        className={cx(buttonBase, variantClass, sizeClass, className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
