"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface ListItemProps
  extends Omit<ComponentPropsWithoutRef<"li">, "css"> {
  /**
   * Render as different HTML element
   * @default "li"
   */
  as?: ElementType;
  /**
   * Visual size variant (inherits from parent list by default)
   * @default "sm"
   */
  size?: "sm" | "md" | "lg";
  /**
   * List item content
   */
  children: ReactNode;
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

const listItemRecipe = cva({
  base: {
    /* Reset */
    margin: 0,
    padding: 0,

    /* Typography */
    lineHeight: 1.75,

    /* Prevent nested paragraphs from adding extra margin */
    "& > p": {
      marginBottom: "0 !important",
    },

    "& > p:not(:last-child)": {
      marginBottom: "2 !important",
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
  },
  defaultVariants: {
    size: "sm",
  },
});

/**
 * A styled list item component for use within OrderedList or UnorderedList.
 *
 * Features proper typography and prevents unwanted spacing from nested paragraphs.
 * Uses Panda CSS for zero-runtime styling with type-safe design tokens.
 *
 * @example
 * ```tsx
 * // Basic list item
 * <ListItem>Item content</ListItem>
 *
 * // List item with nested content
 * <ListItem>
 *   <Paragraph>First paragraph</Paragraph>
 *   <Paragraph>Second paragraph</Paragraph>
 * </ListItem>
 * ```
 */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      as: Component = "li",
      size = "sm",
      children,
      className,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    const classes = cx(listItemRecipe({ size }), css(cssProp), className);

    return (
      <Component ref={ref} className={classes} {...props}>
        {children}
      </Component>
    );
  },
);

ListItem.displayName = "ListItem";
