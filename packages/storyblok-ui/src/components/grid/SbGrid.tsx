import type { SbGridData } from "@httpjpg/storyblok-utils";
import { Grid, type GridColumns } from "@httpjpg/ui";
import { StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";

import { EntranceMotion } from "../../lib/entrance-motion";
import { editableAttrs, spacingStyle } from "../../lib/use-blok";

export interface SbGridProps {
  blok: SbGridData;
}

export const SbGrid = memo(function SbGrid({ blok }: SbGridProps) {
  const {
    items,
    columns,
    columnsMd,
    columnsLg,
    gap,
    rowGap,
    columnGap,
    align,
    justify,
    justifyContent,
    flow,
  } = blok;

  if (!items?.length) {
    return null;
  }

  const spacing = spacingStyle(blok);

  return (
    <EntranceMotion blok={blok}>
      <Grid
        {...editableAttrs(blok)}
        columns={toColumns(columns) ?? 1}
        columnsMd={toColumns(columnsMd)}
        columnsLg={toColumns(columnsLg)}
        gap={gap}
        rowGap={rowGap}
        columnGap={columnGap}
        align={align || undefined}
        justify={justify || undefined}
        justifyContent={justifyContent || undefined}
        flow={flow || undefined}
        css={spacing.css}
        style={spacing.style}
      >
        {items.map((item) => (
          <StoryblokServerComponent key={item._uid} blok={item} />
        ))}
      </Grid>
    </EntranceMotion>
  );
});

SbGrid.displayName = "SbGrid";

/** CMS column count (`"1"`–`"12"`, `"auto"`); empty or unknown values are ignored. */
function toColumns(value: string | undefined): GridColumns | undefined {
  if (value === "auto") {
    return "auto";
  }
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? (n as GridColumns) : undefined;
}
