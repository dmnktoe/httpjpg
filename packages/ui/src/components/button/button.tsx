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

const buttonRecipe = cva({
  base: {
    /* Reset & Base */
    all: "unset",
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "9999px",
    fontFamily: "sans",
    whiteSpace: "nowrap",
    position: "relative",
    overflow: "visible",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    isolation: "isolate",

    /* Blurred background layer */
    _before: {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      zIndex: -1,
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
        color: "white",

        _before: {
          background: "rgba(102, 126, 234, 0.9)",
          filter: "blur(5px)",
          inset: "-3px",
          boxShadow:
            "0 0 20px 0 rgba(102, 126, 234, 0.3), 0 0 40px 0 rgba(102, 126, 234, 0.15)",
        },

        _hover: {
          _before: {
            background: "rgba(123, 147, 245, 0.95)",
            filter: "blur(5px)",
            boxShadow:
              "0 0 25px 0 rgba(123, 147, 245, 0.4), 0 0 45px 0 rgba(123, 147, 245, 0.2)",
          },
        },
      },
      secondary: {
        color: "white",

        _before: {
          background:
            "linear-gradient(135deg, rgba(255, 140, 107, 0.9), rgba(245, 87, 108, 0.9))",
          filter: "blur(5px)",
          inset: "-3px",
          boxShadow:
            "0 0 20px 0 rgba(255, 140, 107, 0.3), 0 0 40px 0 rgba(245, 87, 108, 0.15)",
        },

        _hover: {
          _before: {
            background:
              "linear-gradient(135deg, rgba(255, 160, 127, 0.95), rgba(247, 109, 127, 0.95))",
            filter: "blur(5px)",
            boxShadow:
              "0 0 25px 0 rgba(255, 160, 127, 0.4), 0 0 45px 0 rgba(247, 109, 127, 0.2)",
          },
        },
      },
      outline: {
        color: "white",

        _before: {
          background: "rgba(102, 126, 234, 0.4)",
          filter: "blur(5px)",
          inset: "-3px",
          boxShadow:
            "0 0 20px 0 rgba(102, 126, 234, 0.2), 0 0 40px 0 rgba(102, 126, 234, 0.1)",
        },

        _hover: {
          _before: {
            background: "rgba(123, 147, 245, 0.5)",
            filter: "blur(5px)",
            boxShadow:
              "0 0 25px 0 rgba(123, 147, 245, 0.3), 0 0 45px 0 rgba(123, 147, 245, 0.15)",
          },
        },
      },
      disabled: {
        color: "rgba(150, 150, 150, 0.7)",
        cursor: "not-allowed",

        _before: {
          background: "rgba(100, 100, 100, 0.3)",
          filter: "blur(5px)",
          inset: "-3px",
          boxShadow: "0 0 15px 0 rgba(100, 100, 100, 0.2)",
        },

        _hover: {
          _before: {
            background: "rgba(100, 100, 100, 0.3)",
            filter: "blur(5px)",
            boxShadow: "0 0 15px 0 rgba(100, 100, 100, 0.2)",
          },
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
