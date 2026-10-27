"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { spacingVar } from "../../lib/spacing-var";

export interface ButtonGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "css"> {
  children: ReactNode;
  /** Space between buttons. @default "3" */
  gap?: string | number;
  /** Stacking direction of the group. @default "row" */
  direction?: "row" | "column";
  /** Cross-axis alignment of buttons with differing heights. @default "center" */
  align?: "start" | "center" | "end";
  /** Main-axis distribution of the group. @default "start" */
  justify?: "start" | "center" | "end" | "between";
  /** Wrap onto multiple lines when the group overflows. @default true */
  wrap?: boolean;
  /** Let the buttons fill the group instead of hugging their labels. @default false */
  stretch?: boolean;
  css?: SystemStyleObject;
}

const JUSTIFY: Record<NonNullable<ButtonGroupProps["justify"]>, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
};

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  {
    children,
    gap = "3",
    direction = "row",
    align = "center",
    justify = "start",
    wrap = true,
    stretch = false,
    className,
    css: cssProp,
    style,
    ...props
  },
  ref,
) {
  const gapStyle = { "--button-group-gap": spacingVar(gap) ?? "0", ...style } as CSSProperties;
  const styles = cx(
    css({
      display: "flex",
      flexDirection: direction,
      flexWrap: wrap ? "wrap" : "nowrap",
      alignItems: stretch ? "stretch" : align,
      justifyContent: JUSTIFY[justify],
      gap: "var(--button-group-gap)",
      ...(stretch && direction === "row" && { "& > *": { flex: "1 1 0" } }),
      ...cssProp,
    }),
    className,
  );

  return (
    <div
      ref={ref}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="group"
      className={styles}
      style={gapStyle}
      {...props}
    >
      {children}
    </div>
  );
});

ButtonGroup.displayName = "ButtonGroup";
