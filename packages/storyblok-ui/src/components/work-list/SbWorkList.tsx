"use client";

import type { SbWorkListData } from "@httpjpg/storyblok-utils";
import { WorkList } from "@httpjpg/ui";
import { memo, useEffect, useRef, useState } from "react";

import { editableAttrs, spacingCss } from "../../lib/use-blok";
import { parseCols, resolveStories, toWorkCardProps, type WorkStory } from "./lib";

export interface SbWorkListProps {
  blok: SbWorkListData;
}

export const SbWorkList = memo(function SbWorkList({ blok }: SbWorkListProps) {
  const work = blok.work as Array<string | WorkStory> | undefined;
  const cacheRef = useRef<Map<string, WorkStory>>(new Map());
  const [stories, setStories] = useState<WorkStory[]>(() => resolveStories(work, cacheRef.current));

  useEffect(() => {
    setStories(resolveStories(work, cacheRef.current));
  }, [work]);

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

SbWorkList.displayName = "SbWorkList";
