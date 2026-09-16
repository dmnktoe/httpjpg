"use client";

import NextLink from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { navLink } from "styled-system/recipes";
import type { SystemStyleObject } from "styled-system/types";

import { EXTERNAL_LINK_CURSOR, resolveExternalHref } from "../../lib/external-link";

export interface NavLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "css"
> {
  href: string;
  variant?: "projects" | "websites";
  children: ReactNode;
  isExternal?: boolean;
  showExternalIcon?: boolean;
  css?: SystemStyleObject;
}

export function NavLink({
  variant = "projects",
  children,
  css: cssProp,
  className,
  href,
  isExternal,
  showExternalIcon,
  ...props
}: NavLinkProps) {
  const { external, showIcon, rel, target } = resolveExternalHref(
    href,
    isExternal,
    showExternalIcon,
  );

  const recipeClassName = navLink({ variant });
  const customStyles = cssProp ? css(cssProp) : undefined;
  const mergedClassName = cx(recipeClassName, customStyles, className);

  if (external) {
    return (
      <a
        href={href}
        className={mergedClassName}
        style={{ cursor: EXTERNAL_LINK_CURSOR }}
        rel={rel}
        target={target}
        {...props}
      >
        {children}
        {showIcon && (
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

  return (
    <NextLink href={href} className={mergedClassName} {...props}>
      {children}
    </NextLink>
  );
}

NavLink.displayName = "NavLink";
