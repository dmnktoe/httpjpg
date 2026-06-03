"use client";

import NextLink from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import { button } from "styled-system/recipes";
import type { SystemStyleObject } from "styled-system/types";

import { isExternalLink } from "../../lib/is-external-link";

const externalArrowClass = css({
  ml: "1",
  display: "inline-block",
  lineHeight: "none",
});

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "disabled";
type ButtonSize = "sm" | "md" | "lg";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  css?: SystemStyleObject;
  className?: string;
}

export interface ButtonProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "css" | "children" | "className">,
    CommonProps {
  href?: undefined;
}

export interface ButtonLinkProps
  extends
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "css" | "children" | "className" | "href">,
    CommonProps {
  href: string;
}

export type ButtonOrLinkProps = ButtonProps | ButtonLinkProps;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonOrLinkProps>(
  function Button(
    { variant = "primary", size = "md", children, className, css: cssProp, ...rest },
    ref,
  ) {
    const classes = cx(button({ variant, size }), cssProp && css(cssProp), className);

    if ("href" in rest && rest.href) {
      const { href, ...anchorRest } = rest;
      if (isExternalLink(href)) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            className={classes}
            target="_blank"
            rel="noopener noreferrer"
            {...anchorRest}
          >
            {children}
            <span className={externalArrowClass} aria-hidden="true">
              ↗
            </span>
          </a>
        );
      }
      return (
        <NextLink
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...anchorRest}
        >
          {children}
        </NextLink>
      );
    }

    const { type = "button", ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        className={classes}
        {...buttonRest}
      >
        {children}
      </button>
    );
  },
);
