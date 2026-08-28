"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
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

/** CMS uses `row-dense`; CSS grid-auto-flow requires a space (`row dense`). */
const GRID_AUTO_FLOW = {
  row: "row",
  column: "column",
  "row-dense": "row dense",
  "column-dense": "column dense",
} as const;

type GridFlow = keyof typeof GRID_AUTO_FLOW;

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: keyof typeof GRID_COLUMNS_MAP;
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "stretch";
  justifyContent?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";
  flow?: GridFlow;
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
      style,
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
          w: fullWidth ? "full" : undefined,
          ...cssProp,
        }),
        className,
      )}
      style={{
        alignItems: align || "stretch",
        justifyItems: justify || "stretch",
        ...(justifyContent ? { justifyContent } : {}),
        gridAutoFlow: toGridAutoFlow(flow),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  ),
);

Grid.displayName = "Grid";

function toGridAutoFlow(flow: string | undefined): CSSProperties["gridAutoFlow"] {
  if (flow && flow in GRID_AUTO_FLOW) {
    return GRID_AUTO_FLOW[flow as GridFlow];
  }
  return GRID_AUTO_FLOW.row;
}
