"use client";

import NextLink from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { css, cva } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { isExternalLink } from "../../lib/is-external-link";

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

export const Link = ({
  href,
  children,
  isExternal,
  showExternalIcon,
  css: cssProp,
  className,
  ...props
}: LinkProps) => {
  const isExternalLink_ = isExternal ?? isExternalLink(href);
  const shouldShowIcon = showExternalIcon ?? isExternalLink_;

  const externalProps = isExternalLink_
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  const combinedStyles = css(linkRecipe.raw(), cssProp);

  if (isExternalLink_) {
    return (
      <a
        href={href}
        className={className ? `${combinedStyles} ${className}` : combinedStyles}
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
