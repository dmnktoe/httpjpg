"use client";

import NextLink from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { navLink } from "styled-system/recipes";
import type { SystemStyleObject } from "styled-system/types";

export interface NavLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "css"> {
  /**
   * Link destination (internal or external)
   */
  href: string;
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
   * Force external link behavior
   * Auto-detected for URLs starting with http://, https://, mailto:, tel:
   */
  isExternal?: boolean;
  /**
   * Show external link icon
   * @default true for external links
   */
  showExternalIcon?: boolean;
  /**
   * Custom styles using Panda CSS SystemStyleObject
   */
  css?: SystemStyleObject;
}

/**
 * Detect if a link is external
 */
const isExternalLink = (href: string): boolean => {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
};

/**
 * Navigation Link Component
 * Specialized link for navigation with decorative emoji prefixes
 * - No underline by default
 * - Wavy underline on hover
 * - Supports both internal (Next.js Link) and external links
 *
 * Note: Recipe is defined in panda.config.ts theme.recipes for proper
 * pseudo-element extraction in Panda CSS v1.7.0+
 */
export const NavLink = ({
  variant = "personal",
  children,
  css: cssProp,
  className,
  href,
  isExternal,
  showExternalIcon,
  ...props
}: NavLinkProps) => {
  // Determine if link is external (use prop or auto-detect)
  const isExternalLink_ = isExternal ?? isExternalLink(href);

  // Show external icon by default for external links unless explicitly disabled
  const shouldShowIcon = showExternalIcon ?? isExternalLink_;

  // External link attributes
  const externalProps = isExternalLink_
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  // Apply the recipe className directly for proper pseudo-element rendering
  const recipeClassName = navLink({ variant });

  // Merge recipe with custom CSS prop
  const customStyles = cssProp ? css(cssProp) : undefined;

  // Merge classNames: recipe -> custom -> user className
  const mergedClassName = cx(recipeClassName, customStyles, className);

  // Render external links as regular <a> tags
  if (isExternalLink_) {
    return (
      <a
        href={href}
        className={mergedClassName}
        style={{
          position: "relative",
          zIndex: 1,
          cursor:
            'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><text x="0" y="15" font-size="16">↗</text></svg>\') 10 5, pointer',
        }}
        {...externalProps}
        {...props}
      >
        {children}
        {shouldShowIcon && (
          <span
            style={{
              marginLeft: "0.25em",
              display: "inline-block",
              fontSize: "0.85em",
            }}
            aria-hidden="true"
          >
            ↗
          </span>
        )}
      </a>
    );
  }

  // Render internal links with Next.js Link
  return (
    <NextLink
      href={href}
      className={mergedClassName}
      style={{ position: "relative", zIndex: 1 }}
      {...props}
    >
      {children}
    </NextLink>
  );
};

NavLink.displayName = "NavLink";
