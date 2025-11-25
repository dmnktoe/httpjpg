"use client";

import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import { Icon, type IconName } from "../icon/icon";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "css"> {
  /**
   * Icon name to display
   */
  icon: IconName;
  /**
   * Icon size
   * @default "24px"
   */
  iconSize?: string;
  /**
   * Visual style variant
   * @default "default"
   */
  variant?: "default" | "slideshow" | "ghost";
  /**
   * Button size
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Accessible label for the button
   */
  "aria-label": string;
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

const getVariantStyles = (variant: IconButtonProps["variant"]) => {
  switch (variant) {
    case "slideshow":
      return {
        color: "white",
        filter: "opacity(0.35)",
        transition: "filter 0.2s",
        _hover: {
          filter: "opacity(1)",
        },
      };
    case "ghost":
      return {
        color: "currentColor",
        transition: "opacity 0.2s, transform 0.2s",
        _hover: {
          opacity: 0.7,
          transform: "scale(1.05)",
        },
        _active: {
          transform: "scale(0.95)",
        },
      };
    default:
      return {
        color: "currentColor",
        transition: "all 0.2s",
        _hover: {
          opacity: 0.8,
        },
        _active: {
          transform: "scale(0.95)",
        },
      };
  }
};

const getSizeStyles = (size: IconButtonProps["size"]) => {
  switch (size) {
    case "sm":
      return {
        p: "1",
        minW: "8",
        minH: "8",
      };
    case "lg":
      return {
        p: "3",
        minW: "12",
        minH: "12",
      };
    default:
      return {
        p: "2",
        minW: "10",
        minH: "10",
      };
  }
};

/**
 * IconButton component - Button with icon only
 *
 * A versatile icon button component with multiple variants and sizes.
 * Perfect for navigation controls, tool buttons, and compact actions.
 *
 * @example
 * ```tsx
 * <IconButton icon="arrow-left" aria-label="Go back" />
 *
 * <IconButton
 *   icon="close"
 *   variant="ghost"
 *   size="sm"
 *   aria-label="Close dialog"
 * />
 *
 * <IconButton
 *   icon="arrow-right"
 *   variant="slideshow"
 *   iconSize="64px"
 *   aria-label="Next slide"
 * />
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      iconSize = "24px",
      variant = "default",
      size = "md",
      className,
      css: cssProp,
      type = "button",
      ...props
    },
    ref,
  ) {
    const variantStyles = getVariantStyles(variant);
    const sizeStyles = getSizeStyles(size);

    const styles = cx(
      css({
        all: "unset",
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        bg: "transparent",
        border: "none",
        outline: "none",
        color: "currentColor", // Default color
        _focusVisible: {
          outline: "2px solid",
          outlineColor: "blue.500",
          outlineOffset: "2px",
        },
        _disabled: {
          cursor: "not-allowed",
          opacity: 0.5,
        },
        ...sizeStyles,
        ...variantStyles,
        ...cssProp,
      }),
      className,
    );

    return (
      <button ref={ref} type={type} className={styles} {...props}>
        <Icon name={icon} size={iconSize} />
      </button>
    );
  },
);
