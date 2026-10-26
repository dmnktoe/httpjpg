"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { headline } from "styled-system/recipes";
import type { SystemStyleObject } from "styled-system/types";

import { spacingVar } from "../../lib/spacing-var";

export type HeadlineLevel = 1 | 2 | 3 | 4;

export interface HeadlineProps extends Omit<HTMLAttributes<HTMLHeadingElement>, "css" | "style"> {
  level?: HeadlineLevel;
  align?: "left" | "center" | "right" | "justify";
  children: ReactNode;
  /** Override the HTML tag; defaults to `h{level}`. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  marginTop?: string;
  marginBottom?: string;
  css?: SystemStyleObject;
  style?: React.CSSProperties;
}

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
  const Element = as ?? (`h${level}` as "h1" | "h2" | "h3" | "h4");
  return (
    <Element
      className={cx(
        headline({ level: `${level}`, align }),
        (marginTop || marginBottom) &&
          css({
            mt: marginTop ? "var(--headline-mt)" : undefined,
            mb: marginBottom ? "var(--headline-mb)" : undefined,
          }),
        className,
        cssProp && css(cssProp),
      )}
      style={
        {
          ...(marginTop && { "--headline-mt": spacingVar(marginTop) }),
          ...(marginBottom && { "--headline-mb": spacingVar(marginBottom) }),
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </Element>
  );
}
