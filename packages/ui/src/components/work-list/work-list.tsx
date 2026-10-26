"use client";

import type { ReactNode } from "react";
import { forwardRef, useMemo, useState } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { AsciiArt } from "../ascii-art/ascii-art";
import { ASCII_EMPTY } from "../ascii-art/banners";
import { Box } from "../box/box";
import { Divider, type DividerProps } from "../divider/divider";
import { Grid } from "../grid/grid";
import type { GridColumns } from "../grid/lib";
import { VStack } from "../stack/stack";
import { WorkCard, type WorkCardProps, type WorkCardVariant } from "../work-card/work-card";
import { collectWorkTags, filterWorksByTag } from "./lib";
import { WorkTagFilter } from "./work-tag-filter";

export interface WorkListProps {
  works: WorkCardProps[];
  gap?: string | number;
  /** `1` = stacked, anything else switches to grid. Drives the per-card `sizes` hint. */
  columns?: number;
  columnsMd?: number;
  columnsLg?: number;
  /** Per-card variant unless the card sets its own. */
  variant?: WorkCardVariant;
  /** Honored only in stacked mode. */
  showDividers?: boolean;
  dividerProps?: Omit<DividerProps, "orientation">;
  showTagFilter?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  css?: SystemStyleObject;
}

function sizesFromColumns(columns: number, columnsMd?: number, columnsLg?: number): string {
  const toVw = (n: number) => `${Math.round(100 / n)}vw`;
  const parts: string[] = [];
  if (columnsLg) {
    parts.push(`(min-width: 1024px) ${toVw(columnsLg)}`);
  }
  if (columnsMd) {
    parts.push(`(min-width: 768px) ${toVw(columnsMd)}`);
  }
  parts.push(toVw(columns));
  return parts.join(", ");
}

export const WorkList = forwardRef<HTMLDivElement, WorkListProps>(
  (
    {
      works,
      gap = 24,
      columns = 1,
      columnsMd,
      columnsLg,
      variant,
      showDividers = false,
      dividerProps,
      showTagFilter = false,
      header,
      footer,
      css: cssProp,
      ...props
    },
    ref,
  ) => {
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const availableTags = useMemo(() => collectWorkTags(works), [works]);

    // Derived rather than reset in an effect: a Storyblok live edit can drop
    // the tag that is currently selected, and a stale selection would leave
    // the list empty with an active chip that no longer exists.
    const activeTag =
      selectedTag && availableTags.some(({ tag }) => tag === selectedTag) ? selectedTag : null;
    const visibleWorks = useMemo(() => filterWorksByTag(works, activeTag), [works, activeTag]);

    if (works.length === 0) {
      return (
        <Box ref={ref} css={cssProp} {...props}>
          {header}
          <Box css={{ display: "flex", justifyContent: "center", py: 16, opacity: 0.5 }}>
            <AsciiArt label="No works to display" css={{ fontSize: "sm" }}>
              {ASCII_EMPTY}
            </AsciiArt>
          </Box>
          {footer}
        </Box>
      );
    }

    const isStacked = columns === 1 && !columnsMd && !columnsLg;
    const sizes = sizesFromColumns(columns, columnsMd, columnsLg);

    const cards = visibleWorks.map((work, index) => {
      const cardProps: WorkCardProps = {
        ...work,
        variant: work.variant ?? variant,
        priority: work.priority ?? index === 0,
        sizes: work.sizes ?? sizes,
      };

      if (isStacked) {
        return (
          <VStack key={work.slug || index} gap={0}>
            <WorkCard {...cardProps} />
            {showDividers && index < visibleWorks.length - 1 && (
              <Divider orientation="horizontal" {...dividerProps} />
            )}
          </VStack>
        );
      }
      return <WorkCard key={work.slug || index} {...cardProps} />;
    });

    const filterBar = showTagFilter ? (
      <WorkTagFilter
        tags={availableTags}
        active={activeTag}
        totalCount={works.length}
        onChange={setSelectedTag}
      />
    ) : null;

    if (isStacked) {
      return (
        <Box ref={ref} css={cssProp} {...props}>
          {header}
          {filterBar}
          <VStack gap={gap} align="stretch">
            {cards}
          </VStack>
          {footer}
        </Box>
      );
    }

    return (
      <Box ref={ref} css={cssProp} {...props}>
        {header}
        {filterBar}
        <Grid
          columns={toColumns(columns)}
          columnsMd={columnsMd ? toColumns(columnsMd) : undefined}
          columnsLg={columnsLg ? toColumns(columnsLg) : undefined}
          gap={gap}
        >
          {cards}
        </Grid>
        {footer}
      </Box>
    );
  },
);

function toColumns(n: number): GridColumns {
  return Number.isInteger(n) && n >= 1 && n <= 12 ? (n as GridColumns) : 1;
}

WorkList.displayName = "WorkList";
