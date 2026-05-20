"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

const GRID_COLUMNS_MAP = {
  1: "repeat(1, 1fr)",
  2: "repeat(2, 1fr)",
  3: "repeat(3, 1fr)",
  4: "repeat(4, 1fr)",
  5: "repeat(5, 1fr)",
  6: "repeat(6, 1fr)",
  7: "repeat(7, 1fr)",
  8: "repeat(8, 1fr)",
  9: "repeat(9, 1fr)",
  10: "repeat(10, 1fr)",
  11: "repeat(11, 1fr)",
  12: "repeat(12, 1fr)",
  auto: "repeat(auto-fit, minmax(200px, 1fr))",
} as const;

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: keyof typeof GRID_COLUMNS_MAP;
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "stretch";
  justifyContent?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
  flow?: "row" | "column" | "row-dense" | "column-dense";
  fullWidth?: boolean;
  css?: SystemStyleObject;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      children,
      columns = 12,
      gap = "4",
      rowGap,
      columnGap,
      align = "stretch",
      justify = "stretch",
      justifyContent,
      flow = "row",
      fullWidth = false,
      className,
      css: cssProp,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cx(
        css({
          display: "grid",
          gridTemplateColumns: GRID_COLUMNS_MAP[columns],
          gap: rowGap || columnGap ? undefined : gap,
          rowGap: rowGap || gap,
          columnGap: columnGap || gap,
          alignItems: align,
          justifyItems: justify,
          justifyContent,
          gridAutoFlow: flow,
          w: fullWidth ? "full" : undefined,
          ...cssProp,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

Grid.displayName = "Grid";
