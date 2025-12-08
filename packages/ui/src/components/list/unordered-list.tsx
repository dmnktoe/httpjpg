"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface UnorderedListProps
  extends Omit<ComponentPropsWithoutRef<"ul">, "css"> {
  /**
   * Render as different HTML element
   * @default "ul"
   */
  as?: ElementType;
  /**
   * Visual size variant
   * @default "sm"
   */
  size?: "sm" | "md" | "lg";
  /**
   * List style type
   * @default "disc"
   */
  listStyle?: "disc" | "circle" | "square" | "none";
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

const unorderedListRecipe = cva({
  base: {
    /* Reset */
    margin: 0,
    padding: 0,

    /* List styling */
    paddingLeft: "6", // 24px
    marginTop: "4", // 16px
    marginBottom: "4", // 16px

    /* Nested lists */
    "& ul": {
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
      disc: {
        listStyleType: "disc",
      },
      circle: {
        listStyleType: "circle",
      },
      square: {
        listStyleType: "square",
      },
      none: {
        listStyleType: "none",
        paddingLeft: "0",
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
    listStyle: "disc",
    spacing: "2",
  },
});

/**
 * A styled unordered list component with customizable list styles and spacing.
 *
 * Features proper typography, consistent spacing, and support for nested lists.
 * Uses Panda CSS for zero-runtime styling with type-safe design tokens.
 *
 * @example
 * ```tsx
 * // Basic unordered list
 * <UnorderedList>
 *   <ListItem>First item</ListItem>
 *   <ListItem>Second item</ListItem>
 * </UnorderedList>
 *
 * // Square bullets with larger size
 * <UnorderedList listStyle="square" size="md">
 *   <ListItem>First item</ListItem>
 *   <ListItem>Second item</ListItem>
 * </UnorderedList>
 * ```
 */
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
  ) => {
    const classes = cx(
      unorderedListRecipe({ size, listStyle, spacing }),
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

UnorderedList.displayName = "UnorderedList";
