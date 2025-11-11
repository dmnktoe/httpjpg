"use client";

import { css, cx } from "@linaria/core";
import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Box content
   */
  children?: ReactNode;
  /**
   * Semantic element type
   * @default "div"
   */
  as?:
    | "div"
    | "section"
    | "article"
    | "aside"
    | "header"
    | "footer"
    | "main"
    | "nav";
}

const boxBase = css`
  box-sizing: border-box;
`;

/**
 * Box component - Generic container element
 * Building block for layouts
 */
export const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ as: Component = "div", className, children, ...props }, ref) => {
    return (
      <Component ref={ref} className={cx(boxBase, className)} {...props}>
        {children}
      </Component>
    );
  },
);

Box.displayName = "Box";
