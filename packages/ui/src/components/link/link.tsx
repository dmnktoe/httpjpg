"use client";

import NextLink from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { css, cva } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "css"> {
  /**
   * Link destination
   * Can be internal path or external URL
   */
  href: string;
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

const linkRecipe = cva({
  base: {
    /* Reset */
    textDecoration: "none",
    color: "inherit",

    /* Transitions */
    transition: "all 150ms ease-in-out",

    /* Focus states */
    outline: "none",
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "blue.500",
      outlineOffset: "2px",
    },
  },
});

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
 * General-purpose Link component
 * Supports internal routing via Next.js Link and external links
 */
export const Link = ({
  href,
  children,
  isExternal,
  showExternalIcon,
  css: cssProp,
  className,
  ...props
}: LinkProps) => {
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

  // Combined styles
  const combinedStyles = css(linkRecipe.raw(), cssProp);

  // Render external links as regular <a> tags
  if (isExternalLink_) {
    return (
      <a
        href={href}
        className={
          className ? `${combinedStyles} ${className}` : combinedStyles
        }
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
      className={className ? `${combinedStyles} ${className}` : combinedStyles}
      {...props}
    >
      {children}
    </NextLink>
  );
};

Link.displayName = "Link";
