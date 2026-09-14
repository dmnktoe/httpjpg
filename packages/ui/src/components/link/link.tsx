"use client";

import NextLink from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { css, cva } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { EXTERNAL_LINK_CURSOR, resolveExternalHref } from "../../lib/external-link";

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "css"> {
  href: string;
  children: ReactNode;
  isExternal?: boolean;
  showExternalIcon?: boolean;
  css?: SystemStyleObject;
}

const linkRecipe = cva({
  base: {
    textDecoration: "underline",
    textDecorationThickness: "1px",
    textUnderlineOffset: "2px",
    color: "inherit",
    transition: "text-decoration-style 150ms ease-in-out",
    _hover: {
      textDecorationStyle: "wavy",
    },
    outline: "none",
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "primary.500",
      outlineOffset: "2px",
    },
  },
});

export function Link({
  href,
  children,
  isExternal,
  showExternalIcon,
  css: cssProp,
  className,
  ...props
}: LinkProps) {
  const { external, showIcon, rel, target } = resolveExternalHref(
    href,
    isExternal,
    showExternalIcon,
  );

  const combinedStyles = css(linkRecipe.raw(), cssProp);

  if (external) {
    return (
      <a
        href={href}
        className={className ? `${combinedStyles} ${className}` : combinedStyles}
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
    <NextLink
      href={href}
      className={className ? `${combinedStyles} ${className}` : combinedStyles}
      {...props}
    >
      {children}
    </NextLink>
  );
}

Link.displayName = "Link";
