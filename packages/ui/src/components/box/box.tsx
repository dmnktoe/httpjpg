"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

type PolymorphicRef<C extends ElementType> = ComponentPropsWithoutRef<C>["ref"];

type BoxOwnProps<C extends ElementType = ElementType> = {
  /** HTML element to render. @default "div" */
  as?: C;
  children?: ReactNode;
  css?: SystemStyleObject;
};

export type BoxProps<C extends ElementType = "div"> = BoxOwnProps<C> &
  Omit<ComponentPropsWithoutRef<C>, keyof BoxOwnProps>;

export const Box = forwardRef(
  <C extends ElementType = "div">(
    { as, children, css: cssProp, className, ...props }: BoxProps<C>,
    ref?: PolymorphicRef<C>,
  ) => {
    const Component = as || "div";
    return (
      <Component
        ref={ref}
        className={cx(css({ boxSizing: "border-box" }), cssProp && css(cssProp), className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Box.displayName = "Box";
