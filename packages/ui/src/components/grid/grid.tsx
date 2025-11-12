"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

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
   * Gap between items (Panda spacing token)
   * @default "4"
   */
  gap?: string | number;
  /**
   * Row gap (Panda spacing token)
   * If not set, uses gap value
   */
  rowGap?: string | number;
  /**
   * Column gap (Panda spacing token)
   * If not set, uses gap value
   */
  columnGap?: string | number;
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
  /**
   * Additional Panda CSS styles
   */
  css?: SystemStyleObject;
}

/**
 * Grid component - CSS Grid layout system
 *
 * A powerful 12-column grid system with token-based gaps and full control.
 * Perfect for magazine-style brutalist layouts.
 * Use with GridItem for advanced positioning and spanning.
 *
 * @example
 * ```tsx
 * <Grid columns={12} gap={4}>
 *   <GridItem colSpan={6}>Half width</GridItem>
 *   <GridItem colSpan={6}>Half width</GridItem>
 * </Grid>
 *
 * // Auto-fit responsive grid
 * <Grid columns="auto" gap={6} rowGap={8}>
 *   {items.map(item => <Box key={item.id}>{item.content}</Box>)}
 * </Grid>
 *
 * // Dense packing
 * <Grid columns={4} flow="row-dense" gap={2}>
 *   <GridItem colSpan={2}>Wide</GridItem>
 *   <GridItem>Normal</GridItem>
 * </Grid>
 * ```
 */
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      children,
      columns = 12,
      gap = "4",
      rowGap,
      columnGap,
      align = "stretch",
      justify = "start",
      flow = "row",
      fullWidth = false,
      className,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    // Map columns to Panda token values (ensures static extraction)
    const gridTemplateColumns =
      columns === "auto"
        ? ("repeat(auto-fit, minmax(200px, 1fr))" as const)
        : (`repeat(${columns}, 1fr)` as const);

    const styles = css({
      display: "grid",
      gridTemplateColumns,
      gap: rowGap || columnGap ? undefined : gap,
      rowGap: rowGap || gap,
      columnGap: columnGap || gap,
      alignItems: align,
      justifyItems: justify,
      gridAutoFlow: flow,
      w: fullWidth ? "full" : undefined,
      ...cssProp,
    });

    return (
      <div ref={ref} className={cx(styles, className)} {...props}>
        {children}
      </div>
    );
  },
);

Grid.displayName = "Grid";

export interface GridItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "css"> {
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
  /**
   * Additional Panda CSS styles
   */
  css?: SystemStyleObject;
}

/**
 * GridItem component - Individual grid cell with precise control
 *
 * Use inside Grid to control specific positioning, spanning, and overlap.
 * Perfect for creating complex magazine-style layouts with overlapping elements.
 *
 * @example
 * ```tsx
 * <GridItem colSpan={6} rowSpan={2}>
 *   Spans 6 columns and 2 rows
 * </GridItem>
 *
 * // Precise positioning
 * <GridItem colStart={2} colEnd={5} rowStart={1} rowEnd={3}>
 *   Custom grid area
 * </GridItem>
 *
 * // Full width
 * <GridItem colSpan="full">
 *   Full width content
 * </GridItem>
 * ```
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
      style,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    // Calculate grid positioning
    // For simple spans, Panda will use generated utility classes
    // For complex positioning (start/end), we use inline styles (unavoidable)
    const gridColumn =
      colSpan === "full" && !colStart
        ? "1 / -1"
        : colStart
          ? `${colStart} / ${colEnd || (colSpan === "full" ? "-1" : `span ${colSpan}`)}`
          : `span ${colSpan}`;

    const gridRow = rowStart
      ? `${rowStart} / ${rowEnd || `span ${rowSpan}`}`
      : `span ${rowSpan}`;

    // Combine base styles with custom css prop
    const styles = css({
      boxSizing: "border-box",
      ...cssProp,
    });

    return (
      <div
        ref={ref}
        className={cx(styles, className)}
        style={{
          gridColumn,
          gridRow,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GridItem.displayName = "GridItem";
