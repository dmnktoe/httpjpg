"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { spacingVar } from "../../lib/spacing-var";

const GRID_COLUMNS_MAP = {
  1: "repeat(1, minmax(0, 1fr))",
  2: "repeat(2, minmax(0, 1fr))",
  3: "repeat(3, minmax(0, 1fr))",
  4: "repeat(4, minmax(0, 1fr))",
  5: "repeat(5, minmax(0, 1fr))",
  6: "repeat(6, minmax(0, 1fr))",
  7: "repeat(7, minmax(0, 1fr))",
  8: "repeat(8, minmax(0, 1fr))",
  9: "repeat(9, minmax(0, 1fr))",
  10: "repeat(10, minmax(0, 1fr))",
  11: "repeat(11, minmax(0, 1fr))",
  12: "repeat(12, minmax(0, 1fr))",
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
          // Fixed classes; the values arrive as variables so any column count or gap works.
          gridTemplateColumns: "var(--grid-cols)",
          rowGap: "var(--grid-row-gap)",
          columnGap: "var(--grid-column-gap)",
          w: fullWidth ? "full" : undefined,
          ...cssProp,
        }),
        className,
      )}
      style={{
        ...gridVars(
          columns,
          spacingVar(rowGap) ?? spacingVar(gap),
          spacingVar(columnGap) ?? spacingVar(gap),
        ),
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

function gridVars(
  columns: keyof typeof GRID_COLUMNS_MAP,
  rowGap: string | undefined,
  columnGap: string | undefined,
): CSSProperties {
  return {
    "--grid-cols": GRID_COLUMNS_MAP[columns] ?? GRID_COLUMNS_MAP[12],
    // Always set, so a nested grid never inherits its parent's gaps.
    "--grid-row-gap": rowGap ?? "0",
    "--grid-column-gap": columnGap ?? "0",
  } as CSSProperties;
}

function toGridAutoFlow(flow: string | undefined): CSSProperties["gridAutoFlow"] {
  if (flow && flow in GRID_AUTO_FLOW) {
    return GRID_AUTO_FLOW[flow as GridFlow];
  }
  return GRID_AUTO_FLOW.row;
}
