"use client";

import type { HTMLAttributes, ReactNode, Ref } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

const ALIGN = { start: "flex-start", center: "center", end: "flex-end" } as const;

export interface BadgeGroupProps extends Omit<HTMLAttributes<HTMLElement>, "css"> {
  children: ReactNode;
  /** Space between badges. @default "2" */
  gap?: string | number;
  /** Cross-axis alignment of badges with differing heights. @default "center" */
  align?: keyof typeof ALIGN;
  /** Main-axis distribution of the row. @default "start" */
  justify?: keyof typeof ALIGN;
  /** Wrap onto multiple lines when the row overflows. @default true */
  wrap?: boolean;
  /**
   * Render inline-level (as a `<span>`) so the group flows next to surrounding
   * inline content and stays valid inside a `<p>`. @default false
   */
  inline?: boolean;
  css?: SystemStyleObject;
}

export const BadgeGroup = forwardRef<HTMLElement, BadgeGroupProps>(function BadgeGroup(
  {
    children,
    gap = "2",
    align = "center",
    justify = "start",
    wrap = true,
    inline = false,
    className,
    css: cssProp,
    ...props
  },
  ref,
) {
  const styles = cx(
    css({
      display: inline ? "inline-flex" : "flex",
      flexWrap: wrap ? "wrap" : "nowrap",
      alignItems: ALIGN[align],
      justifyContent: ALIGN[justify],
      gap,
      verticalAlign: "middle",
      ...cssProp,
    }),
    className,
  );

  if (inline) {
    return (
      <span ref={ref as Ref<HTMLSpanElement>} className={styles} {...props}>
        {children}
      </span>
    );
  }
  return (
    <div ref={ref as Ref<HTMLDivElement>} className={styles} {...props}>
      {children}
    </div>
  );
});

BadgeGroup.displayName = "BadgeGroup";
