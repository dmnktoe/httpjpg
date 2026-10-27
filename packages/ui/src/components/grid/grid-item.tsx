"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

import { carryTrack, type GridTrack, trackLine } from "./lib";

/** Where an item sits at one breakpoint. Unset fields carry over from the breakpoint below. */
export interface GridPlacement {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";
  colStart?: number;
  colEnd?: number;
  rowSpan?: number;
  rowStart?: number;
  rowEnd?: number;
}

export interface GridItemProps extends GridPlacement, Omit<HTMLAttributes<HTMLDivElement>, "css"> {
  children?: ReactNode;
  /** Placement from 768px up. */
  md?: GridPlacement;
  /** Placement from 1024px up. */
  lg?: GridPlacement;
  alignSelf?: "start" | "center" | "end" | "stretch" | "baseline";
  justifySelf?: "start" | "center" | "end" | "stretch";
  css?: SystemStyleObject;
}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      children,
      colSpan,
      colStart,
      colEnd,
      rowSpan,
      rowStart,
      rowEnd,
      md,
      lg,
      alignSelf,
      justifySelf,
      className,
      style,
      css: cssProp,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cx(
        css({
          boxSizing: "border-box",
          // Fixed classes: placement arrives as variables, so every breakpoint is a plain
          // media-query override and callers can still restyle the item.
          gridColumn: {
            base: "var(--item-col)",
            md: "var(--item-col-md)",
            lg: "var(--item-col-lg)",
          },
          gridRow: { base: "var(--item-row)", md: "var(--item-row-md)", lg: "var(--item-row-lg)" },
          ...cssProp,
        }),
        className,
      )}
      style={{
        ...placementVars({ colSpan, colStart, colEnd, rowSpan, rowStart, rowEnd }, md, lg),
        ...(alignSelf ? { alignSelf } : {}),
        ...(justifySelf ? { justifySelf } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  ),
);

GridItem.displayName = "GridItem";

/** Always sets all six variables, so a nested item never inherits its parent's placement. */
function placementVars(base: GridPlacement, md: GridPlacement = {}, lg: GridPlacement = {}) {
  const col = cascade(columnTrack(base), columnTrack(md), columnTrack(lg));
  const row = cascade(rowTrack(base), rowTrack(md), rowTrack(lg));
  return {
    "--item-col": trackLine(col.base),
    "--item-col-md": trackLine(col.md),
    "--item-col-lg": trackLine(col.lg),
    "--item-row": trackLine(row.base),
    "--item-row-md": trackLine(row.md),
    "--item-row-lg": trackLine(row.lg),
  } as CSSProperties;
}

function cascade(base: GridTrack, md: GridTrack, lg: GridTrack) {
  const atMd = carryTrack(base, md);
  return { base, md: atMd, lg: carryTrack(atMd, lg) };
}

function columnTrack(p: GridPlacement): GridTrack {
  return { start: p.colStart, end: p.colEnd, span: p.colSpan };
}

function rowTrack(p: GridPlacement): GridTrack {
  return { start: p.rowStart, end: p.rowEnd, span: p.rowSpan };
}
