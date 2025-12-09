"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import { button } from "styled-system/recipes";
import type { SystemStyleObject } from "styled-system/types";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "css"> {
  /**
   * Visual style variant
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "outline" | "disabled";
  /**
   * Button size
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Button content
   */
  children: ReactNode;
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

/**
 * A versatile button component with multiple variants, sizes, and accessibility features.
 *
 * Features glass morphism effects, smooth transitions, and comprehensive keyboard navigation
 * support. Uses Panda CSS for type-safe styling with zero-runtime CSS.
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
      css: cssProp,
      ...props
    },
    ref,
  ) {
    const styles = cx(
      button({ variant, size }),
      cssProp && css(cssProp),
      className,
    );

    return (
      <button ref={ref} type={type} className={styles} {...props}>
        {children}
      </button>
    );
  },
);
