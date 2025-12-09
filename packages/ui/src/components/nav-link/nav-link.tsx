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
  // Apply the recipe className directly for proper pseudo-element rendering
  const recipeClassName = navLink({ variant });
  
  // Apply any custom CSS on top
  const customStyles = cssProp ? css(cssProp) : undefined;
  
  // Merge classNames: recipe -> custom -> user className
  const mergedClassName = cx(
    recipeClassName,
    customStyles,
    className
  );

  return (
    <Link
      {...linkProps}
      showExternalIcon={showExternalIcon}
      className={mergedClassName}
    >
      {children}
    </Link>
  );
};

NavLink.displayName = "NavLink";
