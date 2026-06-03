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
  fontFamily: "mono",
  fontSize: "xs",
  letterSpacing: "wider",
  userSelect: "none",
  opacity: 0.35,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "clip",
  lineHeight: "none",
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
          px: "2",
          display: "flex",
          flexDirection: "column",
          gap: "3",
          width: "full",
        })}
      >
        {title && (
          <div
            className={css({
              fontWeight: "bold",
              fontSize: "lg",
              lineHeight: "tight",
              display: "flex",
              alignItems: "center",
              gap: "2",
            })}
          >
            <span aria-hidden="true" className={css({ fontFamily: "mono", opacity: 0.4 })}>
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
