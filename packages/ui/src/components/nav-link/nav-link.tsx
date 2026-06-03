"use client";

import NextLink from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { navLink } from "styled-system/recipes";
import type { SystemStyleObject } from "styled-system/types";

import { isExternalLink } from "../../lib/is-external-link";

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
  const isExternalLink_ = isExternal ?? isExternalLink(href);
  const shouldShowIcon = showExternalIcon ?? isExternalLink_;

  const externalProps = isExternalLink_
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  const recipeClassName = navLink({ variant });
  const customStyles = cssProp ? css(cssProp) : undefined;
  const mergedClassName = cx(recipeClassName, customStyles, className);

  if (isExternalLink_) {
    return (
      <a
        href={href}
        className={mergedClassName}
        style={{
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

  return (
    <NextLink href={href} className={mergedClassName} {...props}>
      {children}
    </NextLink>
  );
}

NavLink.displayName = "NavLink";
