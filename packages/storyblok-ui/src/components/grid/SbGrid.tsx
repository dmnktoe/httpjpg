"use client";

import { type BlokItem, DynamicRender } from "@httpjpg/storyblok-utils";
import type { SbBlokData } from "@storyblok/react/rsc";
import { memo } from "react";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import { mapSpacingToToken } from "../../lib/spacing-utils";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";

export interface SbGridProps {
  blok: {
    _uid: string;
    items?: SbBlokData[];
    columns?: string;
    columnsMd?: string;
    columnsLg?: string;
    gap?: string;
    rowGap?: string;
    columnGap?: string;
    alignItems?: string;
    justifyItems?: string;
    justifyContent?: string;
    autoFlow?: string;
    boundingWidth?: "container" | "full";
    isList?: boolean;
    pt?: string;
    pb?: string;
    mt?: string;
    mb?: string;
  };
}

/**
 * Storyblok Grid Component
 * Enhanced responsive grid layout with editorial-style controls
 * Supports flexible column configurations, gaps, alignment, and advanced layout options
 */
export const SbGrid = memo(function SbGrid({ blok }: SbGridProps) {
  const {
    items,
    columns,
    columnsMd,
    columnsLg,
    gap,
    rowGap,
    columnGap,
    alignItems,
    justifyItems,
    justifyContent,
    autoFlow,
    boundingWidth = "full",
    isList = false,
    pt,
    pb,
    mt,
    mb,
  } = blok;

  const editableProps = useStoryblokEditable(blok);

  if (!items || items.length === 0) {
    return null;
  }

  // Normalize Storyblok values to CSS values (lowercase, spaces to hyphens)
  const normalizeValue = (value?: string) =>
    value?.toLowerCase().replace(/\s+/g, "-");

  // Use specific row/column gaps if provided, otherwise use uniform gap
  const effectiveRowGap = rowGap || gap;
  const effectiveColumnGap = columnGap || gap;

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

  // Parse column values to numbers for mapping
  const parseColumns = (
    value?: string,
  ): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "auto" => {
    if (!value) {
      return 1;
    }
    if (value.toLowerCase().includes("auto")) {
      return "auto";
    }
    const match = value.match(/(\d+)/);
    if (match) {
      const num = Number.parseInt(match[1], 10);
      if (num >= 1 && num <= 12) {
        return num as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
      }
    }
    return 1;
  };

  const baseColumns = parseColumns(columns);
  const mdColumns = columnsMd ? parseColumns(columnsMd) : undefined;
  const lgColumns = columnsLg ? parseColumns(columnsLg) : undefined;

  // Use CSS custom properties for responsive columns (cleaner than dangerouslySetInnerHTML)
  const inlineStyles: React.CSSProperties = {
    ...(mdColumns &&
      ({ "--grid-columns-md": GRID_COLUMNS_MAP[mdColumns] } as any)),
    ...(lgColumns &&
      ({ "--grid-columns-lg": GRID_COLUMNS_MAP[lgColumns] } as any)),
  };

  const gridStyles: SystemStyleObject = {
    display: "grid",
    gridTemplateColumns: GRID_COLUMNS_MAP[baseColumns],
    gap:
      effectiveRowGap || effectiveColumnGap
        ? undefined
        : mapSpacingToToken(gap),
    rowGap: effectiveRowGap ? mapSpacingToToken(effectiveRowGap) : undefined,
    columnGap: effectiveColumnGap
      ? mapSpacingToToken(effectiveColumnGap)
      : undefined,
    alignItems: alignItems ? (normalizeValue(alignItems) as any) : undefined,
    justifyItems: justifyItems
      ? (normalizeValue(justifyItems) as any)
      : undefined,
    justifyContent: justifyContent
      ? (normalizeValue(justifyContent) as any)
      : undefined,
    gridAutoFlow: autoFlow ? (normalizeValue(autoFlow) as any) : undefined,
    pt: pt ? mapSpacingToToken(pt) : undefined,
    pb: pb ? mapSpacingToToken(pb) : undefined,
    mt: mt ? mapSpacingToToken(mt) : undefined,
    mb: mb ? mapSpacingToToken(mb) : undefined,
    maxWidth: boundingWidth === "container" ? "breakpoint-xl" : undefined,
    mx: boundingWidth === "container" ? "auto" : undefined,
    // Use CSS custom properties in media queries
    ...(mdColumns && {
      md: { gridTemplateColumns: "var(--grid-columns-md)" as any },
    }),
    ...(lgColumns && {
      lg: { gridTemplateColumns: "var(--grid-columns-lg)" as any },
    }),
  };

  if (isList) {
    return (
      <ul
        {...editableProps}
        className={css({
          ...gridStyles,
          listStyle: "none",
        })}
        style={inlineStyles}
      >
        {items.map((item) => (
          <li key={item._uid}>
            <DynamicRender data={[item as BlokItem]} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div {...editableProps} className={css(gridStyles)} style={inlineStyles}>
      {items.map((item) => (
        <DynamicRender key={item._uid} data={[item as BlokItem]} />
      ))}
    </div>
  );
});
