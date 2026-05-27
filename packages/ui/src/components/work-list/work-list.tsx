"use client";

import type { ReactNode } from "react";
import { forwardRef, useId } from "react";
import type { SystemStyleObject } from "styled-system/types";

import { AsciiArt } from "../ascii-art/ascii-art";
import { ASCII_EMPTY } from "../ascii-art/banners";
import { Box } from "../box/box";
import { Divider, type DividerProps } from "../divider/divider";
import { VStack } from "../stack/stack";
import { WorkCard, type WorkCardProps, type WorkCardVariant } from "../work-card/work-card";
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
    const listScopeId = `work-list-${useId().replace(/:/g, "")}`;

    const cards = works.map((work, index) => {
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
            {showDividers && index < works.length - 1 && (
              <Divider orientation="horizontal" {...dividerProps} />
            )}
          </VStack>
        );
      }
      return <WorkCard key={work.slug || index} {...cardProps} />;
    });

    const filterBar = showTagFilter ? (
      <WorkTagFilter scopeSelector={`[data-work-list="${listScopeId}"]`} />
    ) : null;

    if (isStacked) {
      return (
        <Box ref={ref} css={cssProp} {...props}>
          {header}
          {filterBar}
          <VStack data-work-list={listScopeId} gap={gap} align="stretch">
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
        <Box
          data-work-list={listScopeId}
          css={{
            display: "grid",
            gap,
            gridTemplateColumns: {
              base: gridTemplate(columns),
              md: columnsMd ? gridTemplate(columnsMd) : undefined,
              lg: columnsLg ? gridTemplate(columnsLg) : undefined,
            },
          }}
        >
          {cards}
        </Box>
        {footer}
      </Box>
    );
  },
);

const GRID_TEMPLATES: Record<number, string> = {
  1: "repeat(1, 1fr)",
  2: "repeat(2, 1fr)",
  3: "repeat(3, 1fr)",
  4: "repeat(4, 1fr)",
  5: "repeat(5, 1fr)",
  6: "repeat(6, 1fr)",
};

function gridTemplate(n: number): string {
  return GRID_TEMPLATES[n] ?? GRID_TEMPLATES[1];
}

WorkList.displayName = "WorkList";
