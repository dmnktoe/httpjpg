"use client";

import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { navLink } from "styled-system/recipes";
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

/**
 * Navigation Link Component
 * Specialized link for navigation with decorative emoji prefixes and hover underline
 * Based on the general-purpose Link component
 *
 * Note: Recipe is defined in panda.config.ts theme.recipes for proper
 * pseudo-element extraction in Panda CSS v1.7.0+
 */
export const NavLink = ({
  variant = "personal",
  children,
  css: cssProp,
  className,
  showExternalIcon = false,
  ...linkProps
}: NavLinkProps) => {
  const navLinkStyles = css(navLink.raw({ variant }), cssProp);

  return (
    <Link
      {...linkProps}
      showExternalIcon={showExternalIcon}
      className={className ? cx(navLinkStyles, className) : navLinkStyles}
      css={{
        textDecoration: "none",
        _hover: { textDecoration: "underline" },
      }}
    >
      {children}
    </Link>
  );
};

NavLink.displayName = "NavLink";
