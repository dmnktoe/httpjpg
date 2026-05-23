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

const toneStyles: Record<CalloutTone, SystemStyleObject> = {
  neutral: {
    bg: "neutral.50",
    borderColor: "neutral.300",
    color: "neutral.900",
  },
  info: {
    bg: "primary.50",
    borderColor: "primary.500",
    color: "primary.900",
  },
  success: {
    bg: "success.50",
    borderColor: "success.500",
    color: "success.900",
  },
  warning: {
    bg: "warning.50",
    borderColor: "warning.500",
    color: "warning.900",
  },
  danger: {
    bg: "danger.50",
    borderColor: "danger.500",
    color: "danger.900",
  },
  brutalist: {
    bg: "pageBg",
    color: "pageFg",
    borderColor: "pageFg",
    borderWidth: "2px",
    fontFamily: "mono",
  },
};

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
          p: "5",
          borderWidth: "1px",
          borderStyle: "solid",
          borderRadius: "sm",
          textAlign: align === "center" ? "center" : "left",
          alignItems: align === "center" ? "center" : "flex-start",
          ...toneStyles[tone],
        }),
        cssProp && css(cssProp),
        className,
      )}
    >
      {title && (
        <div
          className={css({
            fontWeight: "bold",
            fontSize: "lg",
            lineHeight: "tight",
          })}
        >
          {title}
        </div>
      )}
      <div className={css({ width: "full" })}>{children}</div>
      {action && <div className={css({ mt: "2" })}>{action}</div>}
    </div>
  );
});

Callout.displayName = "Callout";
