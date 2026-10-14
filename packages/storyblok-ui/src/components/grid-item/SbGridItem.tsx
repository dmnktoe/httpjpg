import type { SbGridItemData } from "@httpjpg/storyblok-utils";
import { GridItem, type GridPlacement } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { type CSSProperties, memo } from "react";
import { css } from "styled-system/css";

import { EntranceMotion } from "../../lib/entrance-motion";
import { editableAttrs, spacingStyle } from "../../lib/use-blok";

export interface SbGridItemProps {
  blok: SbGridItemData;
}

export const SbGridItem = memo(function SbGridItem({ blok }: SbGridItemProps) {
  const { content, alignSelf, justifySelf, hiddenBase, hiddenMd, hiddenLg, zIndex } = blok;
  const spacing = spacingStyle(blok);

  const visibility = css({
    display: hiddenBase ? "none" : undefined,
    md: { display: hiddenMd ? "none" : hiddenBase ? "block" : undefined },
    lg: { display: hiddenLg ? "none" : hiddenMd ? "block" : undefined },
  });

  return (
    <GridItem
      {...editableAttrs(blok)}
      colSpan={toColSpan(blok.colSpan)}
      colStart={toLine(blok.colStart)}
      colEnd={toLine(blok.colEnd)}
      rowSpan={toRowSpan(blok.rowSpan)}
      rowStart={toLine(blok.rowStart)}
      rowEnd={toLine(blok.rowEnd)}
      md={{
        colSpan: toColSpan(blok.colSpanMd),
        colStart: toLine(blok.colStartMd),
        rowSpan: toRowSpan(blok.rowSpanMd),
        rowStart: toLine(blok.rowStartMd),
      }}
      lg={{
        colSpan: toColSpan(blok.colSpanLg),
        colStart: toLine(blok.colStartLg),
        rowSpan: toRowSpan(blok.rowSpanLg),
        rowStart: toLine(blok.rowStartLg),
      }}
      alignSelf={alignSelf || undefined}
      justifySelf={justifySelf || undefined}
      className={visibility}
      css={spacing.css}
      style={{ ...spacing.style, ...zIndexStyle(zIndex) }}
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

/** `"1"`–`"12"` or `"full"`; anything else (empty, out of range) leaves the span unset. */
function toColSpan(value?: string): GridPlacement["colSpan"] {
  if (value === "full") {
    return "full";
  }
  const n = toSpan(value);
  return n !== undefined && n <= 12 ? (n as GridPlacement["colSpan"]) : undefined;
}

/** `"full"` stretches across every explicit row (`1 / -1`); rows have no upper count otherwise. */
function toRowSpan(value?: string): GridPlacement["rowSpan"] {
  return value === "full" ? "full" : toSpan(value);
}

/** A span counts tracks, so it must be positive. */
function toSpan(value?: string): number | undefined {
  const n = toLine(value);
  return n !== undefined && n > 0 ? n : undefined;
}

/** A grid line from a CMS number / string field; negative lines count from the end. */
function toLine(value?: string | number): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n !== 0 ? n : undefined;
}

/** Empty CMS number fields arrive as `""`: no z-index, so no stacking context. */
function zIndexStyle(value: unknown): CSSProperties | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const zIndex = Number(value);
  return Number.isInteger(zIndex) ? { zIndex } : undefined;
}
