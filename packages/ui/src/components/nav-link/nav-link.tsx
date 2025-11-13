"use client";

import type { ReactNode } from "react";
import { css, cva, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import { Link, type LinkProps } from "../link/link";

export interface NavLinkProps extends Omit<LinkProps, "css"> {
  /**
   * Visual variant
   * @default "personal"
   */
  variant?: "personal" | "client";
  /**
   * Link content
   */
  children: ReactNode;
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

const navLinkRecipe = cva({
  base: {
    /* Reset & Base */
    display: "block",
    textDecoration: "none",
    color: "inherit",
    fontFamily: "sans",
    fontSize: "inherit",
    lineHeight: "inherit",

    /* Overflow handling */
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",

    /* Transitions */
    transition: "all 150ms ease-in-out",

    /* Hover state - underline only */
    _hover: {
      textDecoration: "underline",
    },

    /* Focus states */
    outline: "none",
    _focusVisible: {
      textDecoration: "underline",
      outline: "2px solid",
      outlineColor: "blue.500",
      outlineOffset: "2px",
    },
  },
  variants: {
    variant: {
      personal: {
        /* Personal/Things work styling */
        _before: {
          content: "'🎀 ୧ꔛꗃ˖ '",
          marginRight: "0.5em",
        },
      },
      client: {
        /* Client work styling */
        _before: {
          content: "'(^‿^)-𝒷))) '",
          marginRight: "0.5em",
        },
      },
    },
  },
  defaultVariants: {
    variant: "personal",
  },
});

/**
 * Navigation Link Component
 * Specialized link for navigation with decorative prefixes and hover underline
 * Based on the general-purpose Link component
 */
export const NavLink = ({
  variant = "personal",
  children,
  css: cssProp,
  className,
  showExternalIcon = false,
  ...linkProps
}: NavLinkProps) => {
  const navLinkStyles = css(navLinkRecipe.raw({ variant }), cssProp);

  return (
    <Link
      {...linkProps}
      showExternalIcon={showExternalIcon}
      className={className ? cx(navLinkStyles, className) : navLinkStyles}
    >
      {children}
    </Link>
  );
};

NavLink.displayName = "NavLink";
