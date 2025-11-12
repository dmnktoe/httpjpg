"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "css"> {
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
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

const buttonRecipe = cva({
  base: {
    /* Reset & Base */
    all: "unset",
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "xl",
    fontFamily: "sans",
    fontWeight: 600,
    whiteSpace: "nowrap",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",

    /* Glass morphism border effect */
    _before: {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      padding: "2px",
      background:
        "linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0))",
      WebkitMask:
        "linear-gradient(white 0 0) content-box, linear-gradient(white 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      opacity: 0,
      transition: "opacity 0.2s",
    },

    _hover: {
      _before: {
        opacity: 1,
      },
    },

    _focusVisible: {
      outline: "2px solid #3b82f6",
      outlineOffset: "2",
    },

    _disabled: {
      cursor: "not-allowed",
      opacity: 0.5,
      filter: "grayscale(0.5)",
    },

    _active: {
      transform: "scale(0.97) translateY(1px)",
    },
  },
  variants: {
    variant: {
      primary: {
        background:
          "linear-gradient(135deg, {colors.primary.500} 0%, {colors.primary.600} 100%)",
        color: "white",
        border: "2px solid {colors.primary.700}",
        boxShadow:
          "0 4px 14px rgba(244, 63, 94, 0.4), 0 2px 6px rgba(244, 63, 94, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.2)",

        _hover: {
          _disabled: {
            background:
              "linear-gradient(135deg, {colors.primary.500} 0%, {colors.primary.600} 100%)",
            boxShadow:
              "0 4px 14px rgba(244, 63, 94, 0.4), 0 2px 6px rgba(244, 63, 94, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
          },
          background:
            "linear-gradient(135deg, {colors.primary.400} 0%, {colors.primary.500} 100%)",
          boxShadow:
            "0 6px 20px rgba(244, 63, 94, 0.5), 0 3px 8px rgba(244, 63, 94, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
        },
      },
      secondary: {
        background:
          "linear-gradient(135deg, {colors.white} 0%, {colors.neutral.100} 100%)",
        color: "neutral.950",
        border: "2px solid {colors.neutral.200}",
        boxShadow:
          "0 2px 10px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(255, 255, 255, 0.8)",

        _hover: {
          _disabled: {
            background:
              "linear-gradient(135deg, {colors.white} 0%, {colors.neutral.100} 100%)",
            borderColor: "neutral.200",
            boxShadow:
              "0 2px 10px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(255, 255, 255, 0.8)",
          },
          background:
            "linear-gradient(135deg, {colors.neutral.50} 0%, {colors.neutral.200} 100%)",
          borderColor: "neutral.300",
          boxShadow:
            "0 4px 14px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.9)",
        },
      },
      outline: {
        background: "rgba(255, 255, 255, 0.05)",
        color: "neutral.950",
        border: "2px solid {colors.neutral.300}",
        backdropFilter: "blur(12px) saturate(180%)",
        boxShadow:
          "0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.4)",

        _hover: {
          _disabled: {
            background: "rgba(255, 255, 255, 0.05)",
            borderColor: "neutral.300",
            backdropFilter: "blur(12px) saturate(180%)",
            boxShadow:
              "0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.4)",
          },
          background: "rgba(0, 0, 0, 0.04)",
          borderColor: "neutral.950",
          backdropFilter: "blur(16px) saturate(200%)",
          boxShadow:
            "0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
        },
      },
    },
    size: {
      sm: {
        fontSize: "0.8125rem",
        paddingX: "4",
        paddingY: "2",
        minHeight: "9",
        lineHeight: 1.25,
      },
      md: {
        fontSize: "0.9375rem",
        paddingX: "7",
        paddingY: "3",
        minHeight: "11",
        lineHeight: 1.375,
      },
      lg: {
        fontSize: "1.0625rem",
        paddingX: "9",
        paddingY: "4",
        minHeight: "14",
        lineHeight: 1.5,
      },
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

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
      buttonRecipe({ variant, size }),
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
