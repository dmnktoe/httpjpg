"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export type CalloutTone = "neutral" | "info" | "success" | "warning" | "danger" | "brutalist";

export interface CalloutProps {
  tone?: CalloutTone;
  title?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  align?: "start" | "center";
  className?: string;
  css?: SystemStyleObject;
}

const STAR_BORDER = "*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚";

const toneColors: Record<CalloutTone, SystemStyleObject> = {
  neutral: { color: "pageFg" },
  info: { color: "primary.900" },
  success: { color: "success.900" },
  warning: { color: "warning.900" },
  danger: { color: "danger.900" },
  brutalist: { color: "pageFg", fontFamily: "mono" },
};

const starBorderClass = css({
  opacity: 0.35,
  fontFamily: "mono",
  fontSize: "xs",
  lineHeight: "none",
  letterSpacing: "wider",
  textOverflow: "clip",
  whiteSpace: "nowrap",
  userSelect: "none",
  overflow: "hidden",
});

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { tone = "neutral", title, children, action, align = "start", className, css: cssProp },
  ref,
) {
  return (
    <div
      ref={ref}
      role="note"
      className={cx(
        css({
          display: "flex",
          flexDirection: "column",
          gap: "3",
          textAlign: align === "center" ? "center" : "left",
          alignItems: align === "center" ? "center" : "flex-start",
          ...toneColors[tone],
        }),
        cssProp && css(cssProp),
        className,
      )}
    >
      <div aria-hidden="true" className={starBorderClass}>
        {STAR_BORDER.repeat(4)}
      </div>
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "3",
          width: "full",
          px: "2",
        })}
      >
        {title && (
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "2",
              fontSize: "lg",
              fontWeight: "bold",
              lineHeight: "tight",
            })}
          >
            <span aria-hidden="true" className={css({ opacity: 0.4, fontFamily: "mono" })}>
              ✦
            </span>
            {title}
          </div>
        )}
        <div className={css({ width: "full" })}>{children}</div>
        {action && <div className={css({ mt: "2" })}>{action}</div>}
      </div>
      <div aria-hidden="true" className={starBorderClass}>
        {STAR_BORDER.repeat(4)}
      </div>
    </div>
  );
});

Callout.displayName = "Callout";
