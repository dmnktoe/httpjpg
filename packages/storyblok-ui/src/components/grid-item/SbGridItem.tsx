"use client";

import { type BlokItem, DynamicRender } from "@httpjpg/storyblok-utils";
import { GridItem } from "@httpjpg/ui";
import type { SbBlokData } from "@storyblok/react/rsc";
import { memo } from "react";
import type { SystemStyleObject } from "styled-system/types";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";

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
    colStart?: string;
    colEnd?: string;
    rowStart?: string;
    rowEnd?: string;
  };
}

/**
 * Storyblok Grid Item Component
 * Individual grid cell with precise control over positioning and spanning
 * Use inside SbGrid for editorial-style layouts with asymmetric compositions
 */
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
  } = blok;

  const editableProps = useStoryblokEditable(blok);

  // Parse column span (supports "full" value)
  const parseColSpan = (
    value?: string,
  ): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full" | undefined => {
    if (!value) {
      return undefined;
    }
    if (value === "full") {
      return "full";
    }
    const num = Number.parseInt(value, 10);
    if (Number.isNaN(num) || num < 1 || num > 12) {
      return undefined;
    }
    return num as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  };

  // Parse row span (numeric only, no "full")
  const parseRowSpan = (value?: string): number | undefined => {
    if (!value) {
      return undefined;
    }
    const num = Number.parseInt(value, 10);
    return Number.isNaN(num) || num < 1 ? undefined : num;
  };

  const parsePosition = (value?: string): number | undefined => {
    if (!value) {
      return undefined;
    }
    const num = Number.parseInt(value, 10);
    return Number.isNaN(num) ? undefined : num;
  };

  // Parse base span values
  const baseColSpan = parseColSpan(colSpan);
  const baseRowSpan = parseRowSpan(rowSpan);

  // Build responsive styles only when we have responsive values
  // and avoid setting base colSpan/rowSpan when we have positioning
  const hasPositioning = colStart || colEnd || rowStart || rowEnd;

  // Properly merge responsive styles to avoid property conflicts
  const itemStyles: SystemStyleObject = {};

  // Build tablet (md) responsive styles
  if (colSpanMd || rowSpanMd) {
    itemStyles.md = {
      ...(colSpanMd && {
        gridColumn:
          colSpanMd === "full" ? "1 / -1" : `span ${parseColSpan(colSpanMd)}`,
      }),
      ...(rowSpanMd && {
        gridRow: `span ${parseRowSpan(rowSpanMd)}`,
      }),
    };
  }

  // Build desktop (lg) responsive styles
  if (colSpanLg || rowSpanLg) {
    itemStyles.lg = {
      ...(colSpanLg && {
        gridColumn:
          colSpanLg === "full" ? "1 / -1" : `span ${parseColSpan(colSpanLg)}`,
      }),
      ...(rowSpanLg && {
        gridRow: `span ${parseRowSpan(rowSpanLg)}`,
      }),
    };
  }

  return (
    <GridItem
      {...editableProps}
      colSpan={hasPositioning ? undefined : baseColSpan}
      rowSpan={hasPositioning ? undefined : baseRowSpan}
      colStart={parsePosition(colStart)}
      colEnd={parsePosition(colEnd)}
      rowStart={parsePosition(rowStart)}
      rowEnd={parsePosition(rowEnd)}
      css={itemStyles}
    >
      {content && content.length > 0 && (
        <DynamicRender data={content as BlokItem[]} />
      )}
    </GridItem>
  );
});
