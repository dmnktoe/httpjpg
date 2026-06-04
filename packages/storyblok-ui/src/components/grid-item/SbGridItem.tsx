import type { SbGridItemData } from "@httpjpg/storyblok-utils";
import { GridItem, type GridItemProps } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo, type CSSProperties } from "react";
import { css, cx } from "styled-system/css";

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
  } as CSSProperties;

  const responsive = css({
    md: {
      gridColumn: colSpanMd ? "var(--col-md)" : undefined,
      gridColumnStart: colStartMd ? "var(--colstart-md)" : undefined,
      gridRow: rowSpanMd ? "var(--row-md)" : undefined,
      gridRowStart: rowStartMd ? "var(--rowstart-md)" : undefined,
    },
    lg: {
      gridColumn: colSpanLg ? "var(--col-lg)" : undefined,
      gridColumnStart: colStartLg ? "var(--colstart-lg)" : undefined,
      gridRow: rowSpanLg ? "var(--row-lg)" : undefined,
      gridRowStart: rowStartLg ? "var(--rowstart-lg)" : undefined,
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
      alignSelf={alignSelf}
      justifySelf={justifySelf}
      className={cx(responsive, visibility)}
      style={styleVars}
    >
      {content?.map((child) => (
        <StoryblokServerComponent key={child._uid} blok={child} />
      ))}
    </GridItem>
  );
});

SbGridItem.displayName = "SbGridItem";
