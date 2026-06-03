"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

const MAX_WIDTH_PRESETS: Record<string, string> = {
  narrow: "45ch",
  readable: "65ch",
  wide: "80ch",
  "extra-wide": "100ch",
};

export interface ParagraphProps extends Omit<ComponentPropsWithoutRef<"p">, "css"> {
  as?: ElementType;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "left" | "center" | "right" | "justify";
  children: ReactNode;
  /** `true` → 65ch. Pass a preset name or any CSS length to override. */
  maxWidth?: boolean | "narrow" | "readable" | "wide" | "extra-wide" | string;
  spacing?: boolean;
  color?: "default" | "muted" | "dimmed";
  weight?: "normal" | "medium" | "semibold";
  css?: SystemStyleObject;
}

const paragraphRecipe = cva({
  base: {
    margin: 0,
    padding: 0,
    fontFamily: "sans",
    lineHeight: 1.75,
    textWrap: "pretty",
  },
  variants: {
    size: {
      sm: { fontSize: "sm", lineHeight: 1.75 },
      md: { fontSize: "md", lineHeight: 1.75 },
      lg: { fontSize: "lg", lineHeight: 1.8 },
      xl: { fontSize: "xl", lineHeight: 1.8 },
    },
    align: {
      left: { textAlign: "left" },
      center: { textAlign: "center", marginLeft: "auto", marginRight: "auto" },
      right: { textAlign: "right", marginLeft: "auto" },
      justify: { textAlign: "justify", textJustify: "inter-word" },
    },
    color: {
      default: { color: "pageFg", opacity: 1 },
      muted: { color: "pageFg", opacity: 0.7 },
      dimmed: { color: "pageFg", opacity: 0.5 },
    },
    weight: {
      normal: { fontWeight: 400 },
      medium: { fontWeight: 500 },
      semibold: { fontWeight: 600 },
    },
    spacing: {
      true: { marginBottom: 4 },
    },
  },
  defaultVariants: {
    size: "sm",
    align: "left",
    color: "default",
    weight: "normal",
    spacing: false,
  },
});

function resolveMaxWidth(value: ParagraphProps["maxWidth"]): string | undefined {
  if (value === true) {
    return "65ch";
  }
  if (typeof value === "string") {
    return MAX_WIDTH_PRESETS[value] ?? value;
  }
  return undefined;
}

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      as: Component = "p",
      size = "sm",
      align = "left",
      color = "default",
      weight = "normal",
      maxWidth = false,
      spacing = false,
      children,
      className,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    const mw = resolveMaxWidth(maxWidth);
    return (
      <Component
        ref={ref}
        className={cx(
          css(paragraphRecipe.raw({ size, align, color, weight, spacing })),
          mw && css({ maxWidth: mw }),
          className,
          cssProp && css(cssProp),
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Paragraph.displayName = "Paragraph";
