"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface GridItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "css"> {
  children?: ReactNode;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";
  rowSpan?: number;
  colStart?: number;
  colEnd?: number;
  rowStart?: number;
  rowEnd?: number;
  alignSelf?: "start" | "center" | "end" | "stretch" | "baseline";
  justifySelf?: "start" | "center" | "end" | "stretch";
  css?: SystemStyleObject;
}

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
      alignSelf,
      justifySelf,
      className,
      style,
      css: cssProp,
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

    const gridRow = rowStart ? `${rowStart} / ${rowEnd || `span ${rowSpan}`}` : `span ${rowSpan}`;

    return (
      <div
        ref={ref}
        className={cx(
          css({ boxSizing: "border-box", alignSelf, justifySelf, ...cssProp }),
          className,
        )}
        style={{ gridColumn, gridRow, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GridItem.displayName = "GridItem";
