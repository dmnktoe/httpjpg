"use client";

import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { Icon, type IconName } from "../icon/icon";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "css"> {
  icon: IconName;
  iconSize?: string;
  variant?: "default" | "slideshow" | "ghost";
  size?: "sm" | "md" | "lg";
  "aria-label": string;
  css?: SystemStyleObject;
}

const VARIANT_STYLES: Record<NonNullable<IconButtonProps["variant"]>, SystemStyleObject> = {
  default: {
    color: "currentColor",
    transition: "all 0.2s",
    _hover: { opacity: 0.8 },
    _active: { transform: "scale(0.95)" },
  },
  slideshow: {
    color: "white",
    filter: "opacity(0.35)",
    transition: "filter 0.2s",
    _hover: { filter: "opacity(1)" },
  },
  ghost: {
    color: "currentColor",
    transition: "opacity 0.2s, transform 0.2s",
    _hover: { opacity: 0.7, transform: "scale(1.05)" },
    _active: { transform: "scale(0.95)" },
  },
};

const SIZE_STYLES: Record<NonNullable<IconButtonProps["size"]>, SystemStyleObject> = {
  sm: { p: "1", minW: "8", minH: "8" },
  md: { p: "2", minW: "10", minH: "10" },
  lg: { p: "3", minW: "12", minH: "12" },
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
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
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
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
          _focusVisible: {
            outline: "2px solid",
            outlineColor: "primary.500",
            outlineOffset: "2px",
          },
          _disabled: { opacity: 0.5, cursor: "not-allowed" },
          ...SIZE_STYLES[size],
          ...VARIANT_STYLES[variant],
          ...cssProp,
        }),
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
});
