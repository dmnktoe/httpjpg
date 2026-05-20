"use client";

import type { AnchorHTMLAttributes } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export type FloatingPreviewBadgePosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export interface FloatingPreviewBadgeProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "css"
> {
  href: string;
  label?: string;
  value?: string;
  position?: FloatingPreviewBadgePosition;
  css?: SystemStyleObject;
}

const POSITION_CSS: Record<FloatingPreviewBadgePosition, SystemStyleObject> = {
  "bottom-right": { bottom: "4", right: "4" },
  "bottom-left": { bottom: "4", left: "4" },
  "top-right": { top: "4", right: "4" },
  "top-left": { top: "4", left: "4" },
};

export const FloatingPreviewBadge = forwardRef<HTMLAnchorElement, FloatingPreviewBadgeProps>(
  function FloatingPreviewBadge(
    {
      href,
      label = "PREVIEW",
      value = "LIVE",
      position = "bottom-right",
      className,
      css: cssProp,
      ...props
    },
    ref,
  ) {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} ${value} — open external preview`}
        className={cx(
          css({
            position: "fixed",
            zIndex: "floating",
            display: "inline-flex",
            alignItems: "stretch",
            fontFamily: "mono",
            fontSize: "sm",
            fontWeight: "bold",
            letterSpacing: "wider",
            textTransform: "uppercase",
            textDecoration: "none",
            lineHeight: "none",
            border: "1px solid",
            borderColor: "black",
            boxShadow: "2px 2px 0 0 black",
            transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
            _hover: {
              transform: "translate(-1px, -1px)",
              boxShadow: "3px 3px 0 0 black",
            },
            _active: {
              transform: "translate(1px, 1px)",
              boxShadow: "1px 1px 0 0 black",
            },
            _focusVisible: {
              outline: "2px solid",
              outlineColor: "var(--accent-of-day, var(--colors-primary-500))",
              outlineOffset: "2px",
            },
            ...POSITION_CSS[position],
          }),
          cssProp && css(cssProp),
          className,
        )}
        {...props}
      >
        <span
          className={css({
            backgroundColor: "black",
            color: "white",
            px: "2",
            py: "1.5",
            display: "inline-flex",
            alignItems: "center",
            gap: "1",
          })}
        >
          <span aria-hidden="true">◆</span>
          {label}
        </span>
        <span
          className={css({
            backgroundColor: "var(--accent-of-day, var(--colors-primary-500))",
            color: "white",
            px: "2",
            py: "1.5",
            display: "inline-flex",
            alignItems: "center",
            gap: "1",
          })}
        >
          {value}
          <span
            aria-hidden="true"
            className={css({
              display: "inline-block",
              fontSize: "md",
              lineHeight: "none",
            })}
          >
            ↗
          </span>
        </span>
      </a>
    );
  },
);
