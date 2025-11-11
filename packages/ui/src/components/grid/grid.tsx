"use client";

import { spacing } from "@httpjpg/tokens";
import { css, cx } from "@linaria/core";
import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Grid content
   */
  children: ReactNode;
  /**
   * Number of columns (1-12)
   * @default 12
   */
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "auto";
  /**
   * Gap between items (using token scale)
   * @default 4
   */
  gap?: keyof typeof spacing;
  /**
   * Row gap (using token scale)
   * If not set, uses gap value
   */
  rowGap?: keyof typeof spacing;
  /**
   * Column gap (using token scale)
   * If not set, uses gap value
   */
  columnGap?: keyof typeof spacing;
  /**
   * Alignment of items
   * @default "stretch"
   */
  align?: "start" | "center" | "end" | "stretch";
  /**
   * Justification of items
   * @default "start"
   */
  justify?: "start" | "center" | "end" | "stretch";
  /**
   * Auto-flow direction
   * @default "row"
   */
  flow?: "row" | "column" | "row-dense" | "column-dense";
  /**
   * Full width
   * @default false
   */
  fullWidth?: boolean;
}

const gridBase = css`
  display: grid;
  box-sizing: border-box;
`;

/**
 * Grid component - CSS Grid layout system
 *
 * A powerful 12-column grid system perfect for magazine-style brutalist layouts.
 * Provides precise control over columns, gaps, and alignment. Use with GridItem
 * for advanced positioning and spanning.
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      children,
      columns = 12,
      gap = 4,
      rowGap,
      columnGap,
      align = "stretch",
      justify = "start",
      flow = "row",
      fullWidth = false,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const gapValue = spacing[gap as keyof typeof spacing] || spacing[4];
    const rowGapValue = rowGap
      ? spacing[rowGap as keyof typeof spacing]
      : undefined;
    const columnGapValue = columnGap
      ? spacing[columnGap as keyof typeof spacing]
      : undefined;

    return (
      <div
        ref={ref}
        className={cx(gridBase, className)}
        style={{
          gridTemplateColumns:
            columns === "auto"
              ? "repeat(auto-fit, minmax(200px, 1fr))"
              : `repeat(${columns}, 1fr)`,
          gap: rowGapValue || columnGapValue ? "0" : gapValue,
          rowGap: rowGapValue,
          columnGap: columnGapValue,
          alignItems: align,
          justifyItems: justify,
          gridAutoFlow: flow,
          width: fullWidth ? "100%" : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Grid.displayName = "Grid";

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Grid item content
   */
  children?: ReactNode;
  /**
   * Column span (1-12 or "full" for full width)
   * @default 1
   */
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";
  /**
   * Row span
   * @default 1
   */
  rowSpan?: number;
  /**
   * Column start position
   */
  colStart?: number;
  /**
   * Column end position
   */
  colEnd?: number;
  /**
   * Row start position
   */
  rowStart?: number;
  /**
   * Row end position
   */
  rowEnd?: number;
}

const gridItemBase = css`
  box-sizing: border-box;
`;

/**
 * GridItem component - Individual grid cell with precise control
 *
 * Use inside Grid to control specific positioning, spanning, and overlap.
 * Perfect for creating complex magazine-style layouts with overlapping elements.
 */
export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      children,
      colSpan = 1,
      rowSpan = 1,
      colStart,
      colEnd,
      rowStart,
      rowEnd,
      className,
      ...props
    },
    ref,
  ) => {
    const gridColumn =
      colSpan === "full" && !colStart
        ? "1 / -1"
        : colStart
          ? `${colStart} / ${colEnd || (colSpan === "full" ? "-1" : `span ${colSpan}`)}`
          : `span ${colSpan}`;

    const gridRow = rowStart
      ? `${rowStart} / ${rowEnd || `span ${rowSpan}`}`
      : `span ${rowSpan}`;

    return (
      <div
        ref={ref}
        className={cx(gridItemBase, className)}
        style={{
          gridColumn,
          gridRow,
          ...props.style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GridItem.displayName = "GridItem";
