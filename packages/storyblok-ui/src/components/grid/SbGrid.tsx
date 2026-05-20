import { Grid, type GridProps } from "@httpjpg/ui";
import { type SbBlokData, StoryblokServerComponent } from "@storyblok/react/rsc";
import { memo } from "react";
import { css } from "styled-system/css";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";

type ColCount = NonNullable<GridProps["columns"]>;

const COLS: Record<string, string> = {
  "1": "repeat(1, 1fr)",
  "2": "repeat(2, 1fr)",
  "3": "repeat(3, 1fr)",
  "4": "repeat(4, 1fr)",
  "5": "repeat(5, 1fr)",
  "6": "repeat(6, 1fr)",
  "7": "repeat(7, 1fr)",
  "8": "repeat(8, 1fr)",
  "9": "repeat(9, 1fr)",
  "10": "repeat(10, 1fr)",
  "11": "repeat(11, 1fr)",
  "12": "repeat(12, 1fr)",
  auto: "repeat(auto-fit, minmax(200px, 1fr))",
};

function toCols(value: string | undefined): ColCount | undefined {
  if (!value) {
    return undefined;
  }
  if (value === "auto") {
    return "auto";
  }
  return value in COLS ? (Number.parseInt(value, 10) as ColCount) : undefined;
}

export interface SbGridProps {
  blok: BlokSpacing & {
    _uid: string;
    items?: SbBlokData[];
    columns?: string;
    columnsMd?: string;
    columnsLg?: string;
    gap?: string;
    rowGap?: string;
    columnGap?: string;
    align?: GridProps["align"];
    justify?: GridProps["justify"];
    justifyContent?: GridProps["justifyContent"];
    flow?: GridProps["flow"];
    isList?: boolean;
  };
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
    isList,
  } = blok;
  const editable = editableAttrs(blok);

  if (!items?.length) {
    return null;
  }

  const styleVars =
    columnsMd || columnsLg
      ? ({
          ...(columnsMd && { "--grid-cols-md": COLS[columnsMd] }),
          ...(columnsLg && { "--grid-cols-lg": COLS[columnsLg] }),
        } as React.CSSProperties)
      : undefined;

  const responsive = css({
    md: columnsMd ? { gridTemplateColumns: "var(--grid-cols-md)" } : {},
    lg: columnsLg ? { gridTemplateColumns: "var(--grid-cols-lg)" } : {},
    ...spacingCss(blok),
  });

  const grid = (
    <Grid
      {...editable}
      columns={toCols(columns) ?? 1}
      gap={gap}
      rowGap={rowGap}
      columnGap={columnGap}
      align={align}
      justify={justify}
      justifyContent={justifyContent}
      flow={flow}
      className={responsive}
      style={styleVars}
    >
      {items.map((item) => (
        <StoryblokServerComponent key={item._uid} blok={item} />
      ))}
    </Grid>
  );

  if (isList) {
    return (
      <ul {...editable} className={css({ listStyle: "none", p: 0, m: 0 })}>
        {grid}
      </ul>
    );
  }

  return grid;
});

SbGrid.displayName = "SbGrid";
