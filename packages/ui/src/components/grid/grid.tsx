"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { spacingVar } from "../../lib/spacing-var";
import { type GridColumns, gridTemplate } from "./lib";

export type { GridColumns };

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
  columns?: GridColumns;
  /** Columns from 768px up; falls back to `columns`. */
  columnsMd?: GridColumns;
  /** Columns from 1024px up; falls back to `columnsMd`. */
  columnsLg?: GridColumns;
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
      columnsMd,
      columnsLg,
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
          gridTemplateColumns: {
            base: "var(--grid-cols)",
            md: "var(--grid-cols-md)",
            lg: "var(--grid-cols-lg)",
          },
          rowGap: "var(--grid-row-gap)",
          columnGap: "var(--grid-column-gap)",
          w: fullWidth ? "full" : undefined,
          ...cssProp,
        }),
        className,
      )}
      style={{
        ...columnVars(columns, columnsMd, columnsLg),
        ...gapVars(spacingVar(rowGap) ?? spacingVar(gap), spacingVar(columnGap) ?? spacingVar(gap)),
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

/** Each breakpoint falls back to the one below; always set, so nested grids never inherit. */
function columnVars(base: GridColumns, md = base, lg = md): CSSProperties {
  return {
    "--grid-cols": gridTemplate(base),
    "--grid-cols-md": gridTemplate(md),
    "--grid-cols-lg": gridTemplate(lg),
  } as CSSProperties;
}

function gapVars(rowGap = "0", columnGap = "0"): CSSProperties {
  return { "--grid-row-gap": rowGap, "--grid-column-gap": columnGap } as CSSProperties;
}

function toGridAutoFlow(flow: string | undefined): CSSProperties["gridAutoFlow"] {
  if (flow && flow in GRID_AUTO_FLOW) {
    return GRID_AUTO_FLOW[flow as GridFlow];
  }
  return GRID_AUTO_FLOW.row;
}
