"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface OrderedListProps extends Omit<ComponentPropsWithoutRef<"ol">, "css"> {
  as?: ElementType;
  size?: "sm" | "md" | "lg";
  listStyle?: "decimal" | "lower-alpha" | "lower-roman" | "upper-alpha" | "upper-roman";
  children: ReactNode;
  spacing?: "0" | "1" | "2" | "3" | "4";
  css?: SystemStyleObject;
}

const baseClass = css({
  margin: 0,
  marginTop: "4",
  marginBottom: "4",
  padding: 0,
  listStyleType: "none",
  counterReset: "ordered-list",
  "& ol": { marginTop: "2", marginBottom: "2" },
  "& > li": { position: "relative", paddingLeft: "8", counterIncrement: "ordered-list" },
  "& > li::before": {
    position: "absolute",
    top: "0",
    left: "0",
    opacity: 0.6,
    fontFamily: "mono",
    lineHeight: "inherit",
    fontVariantNumeric: "tabular-nums",
  },
});

const sizeClasses = {
  sm: css({ fontSize: "sm" }),
  md: css({ fontSize: "md" }),
  lg: css({ fontSize: "lg" }),
};

const listStyleClasses = {
  decimal: css({ "& > li::before": { content: 'counter(ordered-list) "."' } }),
  "lower-alpha": css({
    "& > li::before": { content: 'counter(ordered-list, lower-alpha) "."' },
  }),
  "lower-roman": css({
    "& > li::before": { content: 'counter(ordered-list, lower-roman) "."' },
  }),
  "upper-alpha": css({
    "& > li::before": { content: 'counter(ordered-list, upper-alpha) "."' },
  }),
  "upper-roman": css({
    "& > li::before": { content: 'counter(ordered-list, upper-roman) "."' },
  }),
};

const spacingClasses = {
  "0": css({ "& > li": { marginBottom: "0" } }),
  "1": css({ "& > li": { marginBottom: "1" } }),
  "2": css({ "& > li": { marginBottom: "2" } }),
  "3": css({ "& > li": { marginBottom: "3" } }),
  "4": css({ "& > li": { marginBottom: "4" } }),
};

export const OrderedList = forwardRef<HTMLOListElement, OrderedListProps>(
  (
    {
      as: Component = "ol",
      size = "sm",
      listStyle = "decimal",
      spacing = "2",
      children,
      className,
      css: cssProp,
      ...props
    },
    ref,
  ) => (
    <Component
      ref={ref}
      className={cx(
        baseClass,
        sizeClasses[size],
        listStyleClasses[listStyle],
        spacingClasses[spacing],
        css(cssProp),
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  ),
);

OrderedList.displayName = "OrderedList";
