"use client";

import { type DividerProps, WorkList, type WorkListProps } from "@httpjpg/ui";
import { memo, useEffect, useRef, useState } from "react";

import { type BlokSpacing, editableAttrs, spacingCss } from "../../lib/use-blok";
import { parseCols, resolveStories, toWorkCardProps, type WorkStory } from "./lib";

export interface SbWorkListProps {
  blok: BlokSpacing & {
    _uid: string;
    work?: Array<string | WorkStory>;
    gap?: string;
    columns?: string;
    columnsMd?: string;
    columnsLg?: string;
    variant?: WorkListProps["variant"];
    showDividers?: boolean;
    dividerVariant?: DividerProps["variant"];
    dividerPattern?: string;
    dividerColor?: string;
    dividerSpacing?: string;
    enableTagFilter?: boolean;
  };
}

export const SbWorkList = memo(function SbWorkList({ blok }: SbWorkListProps) {
  const cacheRef = useRef<Map<string, WorkStory>>(new Map());
  const [stories, setStories] = useState<WorkStory[]>(() =>
    resolveStories(blok.work, cacheRef.current),
  );

  useEffect(() => {
    const next = resolveStories(blok.work, cacheRef.current);
    if (next.length > 0) {
      setStories(next);
    }
  }, [blok.work]);

  if (!stories.length) {
    return null;
  }

  const columns = parseCols(blok.columns) ?? 1;
  const columnsMd = parseCols(blok.columnsMd);
  const columnsLg = parseCols(blok.columnsLg);

  return (
    <WorkList
      {...editableAttrs(blok)}
      works={stories.map(toWorkCardProps)}
      gap={blok.gap}
      columns={columns}
      columnsMd={columnsMd}
      columnsLg={columnsLg}
      variant={blok.variant}
      showDividers={blok.showDividers}
      showTagFilter={blok.enableTagFilter}
      dividerProps={
        blok.showDividers
          ? {
              variant: blok.dividerVariant,
              pattern: blok.dividerPattern,
              color: blok.dividerColor,
              spacing: blok.dividerSpacing,
            }
          : undefined
      }
      css={spacingCss(blok)}
    />
  );
});
