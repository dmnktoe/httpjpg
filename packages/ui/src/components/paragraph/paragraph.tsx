"use client";

import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import { paragraph } from "styled-system/recipes";
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
      style,
      ...props
    },
    ref,
  ) => {
    const mw = resolveMaxWidth(maxWidth);
    return (
      <Component
        ref={ref}
        className={cx(
          paragraph({ size, align, color, weight, spacing }),
          mw && css({ maxWidth: "var(--paragraph-max)" }),
          className,
          cssProp && css(cssProp),
        )}
        style={mw ? ({ "--paragraph-max": mw, ...style } as CSSProperties) : style}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Paragraph.displayName = "Paragraph";
