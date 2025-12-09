"use client";

import { type BlokItem, DynamicRender } from "@httpjpg/storyblok-utils";
import { Grid } from "@httpjpg/ui";
import type { SbBlokData } from "@storyblok/react/rsc";
import { memo } from "react";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import { mapSpacingToToken } from "../../lib/spacing-utils";
import { mapGridColumnsToToken } from "../../lib/token-mapping";
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

  const gridStyles: SystemStyleObject = {
    display: "grid",
    gridTemplateColumns: mapGridColumnsToToken(columns),
    gap: rowGap || columnGap ? undefined : mapSpacingToToken(gap),
    rowGap: mapSpacingToToken(rowGap || gap),
    columnGap: mapSpacingToToken(columnGap || gap),
    alignItems: alignItems || undefined,
    justifyItems: justifyItems || undefined,
    justifyContent: justifyContent || undefined,
    gridAutoFlow: autoFlow || undefined,
    pt: mapSpacingToToken(pt),
    pb: mapSpacingToToken(pb),
    mt: mapSpacingToToken(mt),
    mb: mapSpacingToToken(mb),
    md: columnsMd
      ? { gridTemplateColumns: mapGridColumnsToToken(columnsMd) }
      : undefined,
    lg: columnsLg
      ? { gridTemplateColumns: mapGridColumnsToToken(columnsLg) }
      : undefined,
  };

  if (isList) {
    return (
      <ul
        {...editableProps}
        className={css({
          ...gridStyles,
          listStyle: "none",
        })}
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
    <Grid {...editableProps} css={gridStyles}>
      {items.map((item) => (
        <div key={item._uid}>
          <DynamicRender data={[item as BlokItem]} />
        </div>
      ))}
    </Grid>
  );
});
