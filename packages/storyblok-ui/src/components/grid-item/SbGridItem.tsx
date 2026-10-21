import type { SbGridItemData } from "@httpjpg/storyblok-utils";
import { GridItem, type GridItemProps } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo, type CSSProperties } from "react";
import { css, cx } from "styled-system/css";

import { EntranceMotion } from "../../lib/entrance-motion";
import { editableAttrs } from "../../lib/use-blok";

type Span = GridItemProps["colSpan"];

function parseSpan(value?: string): Span | undefined {
  if (!value) {
    return undefined;
  }
  if (value === "full") {
    return "full";
  }
  const n = Number.parseInt(value, 10);
  return n >= 1 && n <= 12 ? (n as Span) : undefined;
}

function spanCss(value: string): string {
  return value === "full" ? "1 / -1" : `span ${value}`;
}

/** Track end paired with an explicit start; a `grid-column` shorthand would reset the start. */
function spanEndCss(value: string): string {
  return value === "full" ? "-1" : `span ${value}`;
}

function rowSpanNumber(value?: string): number | undefined {
  if (!value || value === "full") {
    return undefined;
  }
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export interface SbGridItemProps {
  blok: SbGridItemData;
}

export const SbGridItem = memo(function SbGridItem({ blok }: SbGridItemProps) {
  const {
    content,
    colSpan,
    colSpanMd,
    colSpanLg,
    rowSpan,
    rowSpanMd,
    rowSpanLg,
    colStart,
    colStartMd,
    colStartLg,
    colEnd,
    rowStart,
    rowStartMd,
    rowStartLg,
    rowEnd,
    alignSelf,
    justifySelf,
    hiddenBase,
    hiddenMd,
    hiddenLg,
  } = blok;
  const editable = editableAttrs(blok);

  const styleVars = {
    ...(colSpanMd && { "--col-md": spanCss(colSpanMd) }),
    ...(colSpanLg && { "--col-lg": spanCss(colSpanLg) }),
    ...(rowSpanMd && { "--row-md": spanCss(rowSpanMd) }),
    ...(rowSpanLg && { "--row-lg": spanCss(rowSpanLg) }),
    ...(colStartMd && { "--colstart-md": String(colStartMd) }),
    ...(colStartLg && { "--colstart-lg": String(colStartLg) }),
    ...(rowStartMd && { "--rowstart-md": String(rowStartMd) }),
    ...(rowStartLg && { "--rowstart-lg": String(rowStartLg) }),
    ...(colStartMd && colSpanMd && { "--colend-md": spanEndCss(colSpanMd) }),
    ...(colStartLg && colSpanLg && { "--colend-lg": spanEndCss(colSpanLg) }),
    ...(rowStartMd && rowSpanMd && { "--rowend-md": spanEndCss(rowSpanMd) }),
    ...(rowStartLg && rowSpanLg && { "--rowend-lg": spanEndCss(rowSpanLg) }),
  } as CSSProperties;

  // `GridItem` places the base breakpoint with an inline `grid-area`, which beats any class,
  // so tablet / desktop placement needs `!important` to take over.
  const responsive = css({
    md: {
      gridColumn: colSpanMd && !colStartMd ? "var(--col-md) !important" : undefined,
      gridColumnStart: colStartMd ? "var(--colstart-md) !important" : undefined,
      gridColumnEnd: colStartMd && colSpanMd ? "var(--colend-md) !important" : undefined,
      gridRow: rowSpanMd && !rowStartMd ? "var(--row-md) !important" : undefined,
      gridRowStart: rowStartMd ? "var(--rowstart-md) !important" : undefined,
      gridRowEnd: rowStartMd && rowSpanMd ? "var(--rowend-md) !important" : undefined,
    },
    lg: {
      gridColumn: colSpanLg && !colStartLg ? "var(--col-lg) !important" : undefined,
      gridColumnStart: colStartLg ? "var(--colstart-lg) !important" : undefined,
      gridColumnEnd: colStartLg && colSpanLg ? "var(--colend-lg) !important" : undefined,
      gridRow: rowSpanLg && !rowStartLg ? "var(--row-lg) !important" : undefined,
      gridRowStart: rowStartLg ? "var(--rowstart-lg) !important" : undefined,
      gridRowEnd: rowStartLg && rowSpanLg ? "var(--rowend-lg) !important" : undefined,
    },
  });

  const visibility = css({
    display: hiddenBase ? "none" : undefined,
    md: { display: hiddenMd ? "none" : hiddenBase ? "block" : undefined },
    lg: { display: hiddenLg ? "none" : hiddenMd ? "block" : undefined },
  });

  return (
    <GridItem
      {...editable}
      colSpan={parseSpan(colSpan)}
      rowSpan={rowSpanNumber(rowSpan)}
      colStart={colStart}
      colEnd={colEnd}
      rowStart={rowStart}
      rowEnd={rowEnd}
      alignSelf={alignSelf || undefined}
      justifySelf={justifySelf || undefined}
      className={cx(responsive, visibility)}
      style={styleVars}
    >
      {/* Animate inside the cell: an outer wrapper would become the grid child and drop the placement. */}
      <EntranceMotion blok={blok}>
        {content?.map((child) => (
          <StoryblokServerComponent key={child._uid} blok={child} />
        ))}
      </EntranceMotion>
    </GridItem>
  );
});

SbGridItem.displayName = "SbGridItem";
