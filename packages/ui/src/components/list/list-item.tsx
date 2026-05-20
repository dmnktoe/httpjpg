"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface ListItemProps extends Omit<ComponentPropsWithoutRef<"li">, "css"> {
  as?: ElementType;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  css?: SystemStyleObject;
}

const recipe = cva({
  base: {
    margin: 0,
    padding: 0,
    lineHeight: 1.75,
    "& p": { marginBottom: "0" },
  },
  variants: {
    size: {
      sm: { fontSize: "sm" },
      md: { fontSize: "md" },
      lg: { fontSize: "lg" },
    },
  },
  defaultVariants: { size: "sm" },
});

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  ({ as: Component = "li", size = "sm", children, className, css: cssProp, ...props }, ref) => (
    <Component ref={ref} className={cx(recipe({ size }), css(cssProp), className)} {...props}>
      {children}
    </Component>
  ),
);

ListItem.displayName = "ListItem";
