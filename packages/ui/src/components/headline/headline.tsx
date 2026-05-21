"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

const HEADLINE_FONT_SIZES = {
  1: "clamp(2.25rem, 5vw + 1rem, 3.75rem)",
  2: "clamp(1.875rem, 4vw + 1rem, 3rem)",
  3: "clamp(1.5rem, 3vw + 0.5rem, 2.25rem)",
} as const;

export interface HeadlineProps extends Omit<HTMLAttributes<HTMLHeadingElement>, "css" | "style"> {
  level?: 1 | 2 | 3;
  align?: "left" | "center" | "right" | "justify";
  children: ReactNode;
  /** Override the HTML tag; defaults to `h{level}`. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  marginTop?: string;
  marginBottom?: string;
  css?: SystemStyleObject;
  style?: React.CSSProperties;
}

const headlineRecipe = cva({
  base: {
    margin: 0,
    padding: 0,
    fontFamily: "headline",
    fontWeight: "bold",
    letterSpacing: "tight",
    lineHeight: 1,
    textWrap: "balance",
  },
  variants: {
    level: {
      1: {
        fontSize: HEADLINE_FONT_SIZES[1],
        fontWeight: "black",
        letterSpacing: "tighter",
      },
      2: {
        fontSize: HEADLINE_FONT_SIZES[2],
        fontWeight: "extrabold",
        letterSpacing: "tighter",
      },
      3: { fontSize: HEADLINE_FONT_SIZES[3], fontWeight: "bold" },
    },
    align: {
      left: { textAlign: "left" },
      center: { textAlign: "center" },
      right: { textAlign: "right" },
      justify: { textAlign: "justify", textJustify: "inter-word", textWrap: "wrap" },
    },
  },
  defaultVariants: { level: 1 },
});

export function Headline({
  level = 1,
  align,
  children,
  as,
  marginTop,
  marginBottom,
  className,
  css: cssProp,
  style,
  ...props
}: HeadlineProps) {
  const Element = as ?? (`h${level}` as "h1" | "h2" | "h3");
  return (
    <Element
      className={cx(
        css(headlineRecipe.raw({ level, align })),
        (marginTop || marginBottom) &&
          css({
            ...(marginTop && { mt: marginTop }),
            ...(marginBottom && { mb: marginBottom }),
          }),
        className,
        cssProp && css(cssProp),
      )}
      style={style}
      {...props}
    >
      {children}
    </Element>
  );
}
