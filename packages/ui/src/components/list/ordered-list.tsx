"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface OrderedListProps
  extends Omit<ComponentPropsWithoutRef<"ol">, "css"> {
  /**
   * Render as different HTML element
   * @default "ol"
   */
  as?: ElementType;
  /**
   * Visual size variant
   * @default "sm"
   */
  size?: "sm" | "md" | "lg";
  /**
   * List style type
   * @default "decimal"
   */
  listStyle?:
    | "decimal"
    | "lower-alpha"
    | "lower-roman"
    | "upper-alpha"
    | "upper-roman";
  /**
   * List content
   */
  children: ReactNode;
  /**
   * Vertical spacing between items
   * @default "2"
   */
  spacing?: "0" | "1" | "2" | "3" | "4";
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

const orderedListRecipe = cva({
  base: {
    /* Reset */
    margin: 0,
    padding: 0,

    /* List styling */
    listStylePosition: "outside",
    paddingLeft: "6", // 24px
    marginTop: "4", // 16px
    marginBottom: "4", // 16px

    /* Nested lists */
    "& ol": {
      marginTop: "2",
      marginBottom: "2",
    },
  },
  variants: {
    size: {
      sm: {
        fontSize: "sm", // 12px
      },
      md: {
        fontSize: "md", // 14px
      },
      lg: {
        fontSize: "lg", // 16px
      },
    },
    listStyle: {
      decimal: {
        listStyleType: "decimal",
      },
      "lower-alpha": {
        listStyleType: "lower-alpha",
      },
      "lower-roman": {
        listStyleType: "lower-roman",
      },
      "upper-alpha": {
        listStyleType: "upper-alpha",
      },
      "upper-roman": {
        listStyleType: "upper-roman",
      },
    },
    spacing: {
      "0": {
        "& > li": {
          marginBottom: "0",
        },
      },
      "1": {
        "& > li": {
          marginBottom: "1",
        },
      },
      "2": {
        "& > li": {
          marginBottom: "2",
        },
      },
      "3": {
        "& > li": {
          marginBottom: "3",
        },
      },
      "4": {
        "& > li": {
          marginBottom: "4",
        },
      },
    },
  },
  defaultVariants: {
    size: "sm",
    listStyle: "decimal",
    spacing: "1",
  },
});

/**
 * A styled ordered list component with customizable list styles and spacing.
 *
 * Features proper typography, consistent spacing, and support for nested lists.
 * Uses Panda CSS for zero-runtime styling with type-safe design tokens.
 *
 * @example
 * ```tsx
 * // Basic ordered list
 * <OrderedList>
 *   <ListItem>First item</ListItem>
 *   <ListItem>Second item</ListItem>
 * </OrderedList>
 *
 * // Roman numerals with larger size
 * <OrderedList listStyle="upper-roman" size="md">
 *   <ListItem>First item</ListItem>
 *   <ListItem>Second item</ListItem>
 * </OrderedList>
 * ```
 */
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
  ) => {
    const classes = cx(
      orderedListRecipe({ size, listStyle, spacing }),
      css(cssProp),
      className,
    );

    return (
      <Component ref={ref} className={classes} {...props}>
        {children}
      </Component>
    );
  },
);

OrderedList.displayName = "OrderedList";
