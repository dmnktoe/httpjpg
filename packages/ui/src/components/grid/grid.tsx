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
   * Justification of items in their grid areas (justifyItems)
   * @default "stretch"
   */
  justify?: "start" | "center" | "end" | "stretch";
  /**
   * Justification of grid tracks within the grid container (justify-content)
   * Use for distributing space between/around columns
   */
  justifyContent?:
    | "start"
    | "center"
    | "end"
    | "space-between"
    | "space-around"
    | "space-evenly";
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
      justify = "stretch",
      justifyContent,
      flow = "row",
      fullWidth = false,
      className,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    // Static mapping for grid columns - required for Panda CSS static analysis
    const GRID_COLUMNS_MAP = {
      1: "repeat(1, 1fr)" as const,
      2: "repeat(2, 1fr)" as const,
      3: "repeat(3, 1fr)" as const,
      4: "repeat(4, 1fr)" as const,
      5: "repeat(5, 1fr)" as const,
      6: "repeat(6, 1fr)" as const,
      7: "repeat(7, 1fr)" as const,
      8: "repeat(8, 1fr)" as const,
      9: "repeat(9, 1fr)" as const,
      10: "repeat(10, 1fr)" as const,
      11: "repeat(11, 1fr)" as const,
      12: "repeat(12, 1fr)" as const,
      auto: "repeat(auto-fit, minmax(200px, 1fr))" as const,
    };

    const gridTemplateColumns = GRID_COLUMNS_MAP[columns];

    const styles = css({
      display: "grid",
      gridTemplateColumns,
      gap: rowGap || columnGap ? undefined : gap,
      rowGap: rowGap || gap,
      columnGap: columnGap || gap,
      alignItems: align,
      justifyItems: justify,
      justifyContent: justifyContent,
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
