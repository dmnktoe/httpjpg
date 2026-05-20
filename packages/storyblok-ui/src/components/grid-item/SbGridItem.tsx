import { GridItem, type GridItemProps } from "@httpjpg/ui";
import { type SbBlokData, StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo, type CSSProperties } from "react";
import { css } from "styled-system/css";

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

export interface SbGridItemProps {
  blok: {
    _uid: string;
    content?: SbBlokData[];
    colSpan?: string;
    colSpanMd?: string;
    colSpanLg?: string;
    rowSpan?: string;
    rowSpanMd?: string;
    rowSpanLg?: string;
    colStart?: number;
    colEnd?: number;
    rowStart?: number;
    rowEnd?: number;
    alignSelf?: GridItemProps["alignSelf"];
    justifySelf?: GridItemProps["justifySelf"];
  };
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
    colEnd,
    rowStart,
    rowEnd,
    alignSelf,
    justifySelf,
  } = blok;
  const editable = editableAttrs(blok);

  const styleVars = {
    ...(colSpanMd && { "--col-md": spanCss(colSpanMd) }),
    ...(colSpanLg && { "--col-lg": spanCss(colSpanLg) }),
    ...(rowSpanMd && { "--row-md": `span ${rowSpanMd}` }),
    ...(rowSpanLg && { "--row-lg": `span ${rowSpanLg}` }),
  } as CSSProperties;

  const responsive = css({
    md: {
      gridColumn: colSpanMd ? "var(--col-md)" : undefined,
      gridRow: rowSpanMd ? "var(--row-md)" : undefined,
    },
    lg: {
      gridColumn: colSpanLg ? "var(--col-lg)" : undefined,
      gridRow: rowSpanLg ? "var(--row-lg)" : undefined,
    },
  });

  return (
    <GridItem
      {...editable}
      colSpan={parseSpan(colSpan)}
      rowSpan={rowSpan ? Number.parseInt(rowSpan, 10) : undefined}
      colStart={colStart}
      colEnd={colEnd}
      rowStart={rowStart}
      rowEnd={rowEnd}
      alignSelf={alignSelf}
      justifySelf={justifySelf}
      className={responsive}
      style={styleVars}
    >
      {content?.map((child) => (
        <StoryblokServerComponent key={child._uid} blok={child} />
      ))}
    </GridItem>
  );
});

SbGridItem.displayName = "SbGridItem";
