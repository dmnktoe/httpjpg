"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface UnorderedListProps extends Omit<ComponentPropsWithoutRef<"ul">, "css"> {
  as?: ElementType;
  size?: "sm" | "md" | "lg";
  listStyle?: "disc" | "circle" | "square" | "none";
  children: ReactNode;
  spacing?: "0" | "1" | "2" | "3" | "4";
  css?: SystemStyleObject;
}

const baseClass = css({
  margin: 0,
  padding: 0,
  marginTop: "4",
  marginBottom: "4",
  listStyleType: "none",
  "& ul": { marginTop: "2", marginBottom: "2" },
  "& > li": {
    position: "relative",
    paddingLeft: "6",
  },
  "& > li::before": {
    position: "absolute",
    left: "0",
    top: "0",
    opacity: 0.6,
    fontFamily: "mono",
    lineHeight: "inherit",
  },
});

const sizeClasses = {
  sm: css({ fontSize: "sm" }),
  md: css({ fontSize: "md" }),
  lg: css({ fontSize: "lg" }),
};

const listStyleClasses = {
  disc: css({ "& > li::before": { content: '"●"' } }),
  circle: css({ "& > li::before": { content: '"○"' } }),
  square: css({ "& > li::before": { content: '"■"' } }),
  none: css({ "& > li": { paddingLeft: "0" }, "& > li::before": { content: '""' } }),
};

const spacingClasses = {
  "0": css({ "& > li": { marginBottom: "0" } }),
  "1": css({ "& > li": { marginBottom: "1" } }),
  "2": css({ "& > li": { marginBottom: "2" } }),
  "3": css({ "& > li": { marginBottom: "3" } }),
  "4": css({ "& > li": { marginBottom: "4" } }),
};

export const UnorderedList = forwardRef<HTMLUListElement, UnorderedListProps>(
  (
    {
      as: Component = "ul",
      size = "sm",
      listStyle = "disc",
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

UnorderedList.displayName = "UnorderedList";
