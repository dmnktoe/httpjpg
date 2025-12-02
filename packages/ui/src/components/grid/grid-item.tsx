"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

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
