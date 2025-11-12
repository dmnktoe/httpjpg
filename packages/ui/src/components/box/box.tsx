"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { css } from "../../../styled-system/css";
import type { SystemStyleObject } from "../../../styled-system/types";

type PolymorphicRef<C extends ElementType> = ComponentPropsWithoutRef<C>["ref"];

type BoxOwnProps<C extends ElementType = ElementType> = {
  /**
   * Semantic element type
   * @default "div"
   */
  as?: C;
  /**
   * Box content
   */
  children?: ReactNode;
  /**
   * CSS styles using Panda CSS style object
   */
  css?: SystemStyleObject;
};

export type BoxProps<C extends ElementType = "div"> = BoxOwnProps<C> &
  Omit<ComponentPropsWithoutRef<C>, keyof BoxOwnProps>;

/**
 * Box component - Generic polymorphic container
 *
 * The foundation of all layout components. Use as a building block
 * for custom layouts with full Panda CSS style prop support.
 *
 * Supports polymorphic rendering via the 'as' prop to use semantic HTML elements.
 *
 * @example
 * ```tsx
 * <Box css={{ p: 4, bg: "neutral.100", borderRadius: "lg" }}>
 *   Content
 * </Box>
 *
 * // Polymorphic rendering
 * <Box as="section" css={{ minH: "100vh" }}>
 *   Section content
 * </Box>
 *
 * <Box as="header" css={{ py: 4 }}>
 *   Navigation
 * </Box>
 * ```
 */
export const Box = forwardRef(
  <C extends ElementType = "div">(
    { as, children, css: cssProp, className, ...props }: BoxProps<C>,
    ref?: PolymorphicRef<C>,
  ) => {
    const Component = as || "div";

    const baseStyles = css({
      boxSizing: "border-box",
    });

    const customStyles = cssProp ? css(cssProp) : "";

    return (
      <Component
        ref={ref}
        className={[baseStyles, customStyles, className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </Component>
    );
  },
) as <C extends ElementType = "div">(
  props: BoxProps<C> & { ref?: PolymorphicRef<C> },
) => JSX.Element;
