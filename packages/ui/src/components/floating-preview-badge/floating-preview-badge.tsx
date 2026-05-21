"use client";

import type { AnchorHTMLAttributes } from "react";
import { forwardRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

const MOBILE_SIZE = 40;
const DESKTOP_HEIGHT = 32;
const DESKTOP_PREFIX = "(っ◔◡◔)っ ♥ preview •°*”˜.•°*”˜ ";
const BACKDROP_FILTER = "blur(20px) saturate(180%)";

export interface FloatingPreviewBadgeProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "css"
> {
  href: string;
  label?: string;
  css?: SystemStyleObject;
}

const arrowClass = css({
  display: "inline-block",
  fontSize: "1.6em",
  lineHeight: "1",
  verticalAlign: "middle",
});

export const FloatingPreviewBadge = forwardRef<HTMLAnchorElement, FloatingPreviewBadgeProps>(
  function FloatingPreviewBadge(
    { href, label = "preview", className, css: cssProp, style, ...props },
    ref,
  ) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return null;
    }

    const anchor = (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} — open external preview`}
        style={{
          backdropFilter: BACKDROP_FILTER,
          WebkitBackdropFilter: BACKDROP_FILTER,
          ...style,
        }}
        className={cx(
          css({
            position: "fixed",
            bottom: "8",
            left: "0",
            right: "0",
            marginInline: "auto",
            zIndex: "previewBadge",
            width: `${MOBILE_SIZE}px`,
            height: `${MOBILE_SIZE}px`,
            borderRadius: "full",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.32)",
            border: "1px solid rgba(255, 255, 255, 0.28)",
            color: "white",
            fontFamily: "mono",
            fontSize: "sm",
            fontWeight: "normal",
            letterSpacing: "wider",
            textDecoration: "none",
            lineHeight: "none",
            whiteSpace: "nowrap",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.6), 0 0 6px rgba(0, 0, 0, 0.3)",
            boxShadow:
              "0 8px 32px 0 rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.30), inset 0 -1px 0 0 rgba(0, 0, 0, 0.25)",
            transition:
              "transform 150ms ease-out, box-shadow 200ms ease-out, background-color 200ms ease-out, border-color 200ms ease-out",
            sm: {
              width: "fit-content",
              height: `${DESKTOP_HEIGHT}px`,
              paddingInline: "4",
            },
            _hover: {
              transform: "translateY(-1px)",
              backgroundColor: "rgba(0, 0, 0, 0.42)",
              borderColor: "rgba(255, 255, 255, 0.45)",
              boxShadow:
                "0 12px 40px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.40), inset 0 -1px 0 0 rgba(0, 0, 0, 0.25)",
            },
            _active: { transform: "translateY(1px)" },
            _focusVisible: {
              outline: "2px solid",
              outlineColor: "var(--accent-of-day, var(--colors-primary-500))",
              outlineOffset: "2px",
            },
          }),
          cssProp && css(cssProp),
          className,
        )}
        {...props}
      >
        <span
          className={css({
            display: "none",
            sm: { display: "inline" },
          })}
        >
          {DESKTOP_PREFIX}
        </span>
        <span aria-hidden="true" className={arrowClass}>
          ↗
        </span>
      </a>
    );

    return createPortal(anchor, document.body);
  },
);
