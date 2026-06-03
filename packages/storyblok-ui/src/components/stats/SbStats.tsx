import type { SbStatsData } from "@httpjpg/storyblok-utils";
import { Box, Stats, type StatsProps } from "@httpjpg/ui";
import { memo } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";

export interface SbStatsProps {
  blok: SbStatsData;
}

function parseColumns(value?: string): StatsProps["columns"] {
  if (!value) {
    return undefined;
  }
  const n = Number.parseInt(value, 10);
  return n >= 1 && n <= 4 ? (n as StatsProps["columns"]) : undefined;
}

export const SbStats = memo(function SbStats({ blok }: SbStatsProps) {
  const { items, columns, variant, align } = blok;

  if (!items?.length) {
    return null;
  }

  const statItems = items.map((item) => ({
    id: item._uid,
    value: item.value,
    label: item.label,
    caption: item.caption || undefined,
  }));

  return (
    <Box {...editableAttrs(blok)} css={spacingCss(blok)}>
      <Stats items={statItems} columns={parseColumns(columns)} variant={variant} align={align} />
    </Box>
  );
});

SbStats.displayName = "SbStats";
