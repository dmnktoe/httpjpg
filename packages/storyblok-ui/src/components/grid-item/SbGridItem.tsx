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

  // Parse numeric values from strings
  const parseSpan = (value?: string): number | "full" | undefined => {
    if (!value) {
      return undefined;
    }
    if (value === "full") {
      return "full";
    }
    const num = Number.parseInt(value, 10);
    return Number.isNaN(num) ? undefined : num;
  };

  const parsePosition = (value?: string): number | undefined => {
    if (!value) {
      return undefined;
    }
    const num = Number.parseInt(value, 10);
    return Number.isNaN(num) ? undefined : num;
  };

  // Base styles with responsive spans
  const itemStyles: SystemStyleObject = {
    md: {
      ...(colSpanMd && { gridColumn: `span ${parseSpan(colSpanMd)}` }),
      ...(rowSpanMd && { gridRow: `span ${parseSpan(rowSpanMd)}` }),
    },
    lg: {
      ...(colSpanLg && { gridColumn: `span ${parseSpan(colSpanLg)}` }),
      ...(rowSpanLg && { gridRow: `span ${parseSpan(rowSpanLg)}` }),
    },
  };

  return (
    <GridItem
      {...editableProps}
      colSpan={parseSpan(colSpan) as any}
      rowSpan={parseSpan(rowSpan) as any}
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
