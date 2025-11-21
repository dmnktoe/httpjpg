import { DynamicRender } from "@httpjpg/storyblok-utils";
import { Grid } from "@httpjpg/ui";
import { type SbBlokData, storyblokEditable } from "@storyblok/react/rsc";
import { css } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";

export interface SbGridProps {
  blok: {
    _uid: string;
    items?: SbBlokData[];
    columns?: 1 | 2 | 3 | 4 | 6 | 12;
    columnsMd?: 1 | 2 | 3 | 4 | 6 | 12;
    gap?: string;
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
 * Responsive grid layout with configurable columns and gap
 */
export function SbGrid({ blok }: SbGridProps) {
  const {
    items,
    columns = 1,
    columnsMd,
    gap = "4",
    isList = false,
    pt,
    pb,
    mt,
    mb,
  } = blok;

  if (!items || items.length === 0) {
    return null;
  }

  const gridStyles: SystemStyleObject = {
    display: "grid",
    gridTemplateColumns: columns.toString(),
    md: columnsMd ? { gridTemplateColumns: columnsMd.toString() } : undefined,
    gap,
    pt: pt || undefined,
    pb: pb || undefined,
    mt: mt || undefined,
    mb: mb || undefined,
  };

  if (isList) {
    return (
      <ul
        {...storyblokEditable(blok)}
        className={css({
          ...gridStyles,
          listStyle: "none",
        })}
      >
        {items.map((item) => (
          <li key={item._uid}>
            <DynamicRender data={[item] as any} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Grid {...storyblokEditable(blok)} css={gridStyles}>
      {items.map((item) => (
        <div key={item._uid}>
          <DynamicRender data={[item] as any} />
        </div>
      ))}
    </Grid>
  );
}
