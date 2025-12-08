"use client";

import { type BlokItem, DynamicRender } from "@httpjpg/storyblok-utils";
import { Page } from "@httpjpg/ui";
import type { SbBlokData } from "@storyblok/react/rsc";
import { memo } from "react";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";
import type { StoryblokImage } from "../../types";

/**
 * Work Page Component Props
 */
export interface SbPageWorkProps {
  blok: {
    _uid: string;
    body?: SbBlokData[];
    title?: string;
    description?: any;
    images?: StoryblokImage[];
    link?: {
      url?: string;
      cached_url?: string;
      linktype?: string;
      target?: string;
    };
    external_only?: boolean;
    isDark?: boolean;
  };
}

/**
 * Flexible Work/Portfolio Page for Storyblok
 * Completely customizable through Visual Editor with nested components
 *
 * Usage in Storyblok:
 * - Add any components you want (sections, grids, images, text, etc.)
 * - Arrange them freely in the Visual Editor
 * - No fixed structure - full creative freedom
 */
export const SbPageWork = memo(function SbPageWork({ blok }: SbPageWorkProps) {
  const { body, external_only, isDark = false } = blok;
  const editableProps = useStoryblokEditable(blok);

  return (
    <Page
      {...editableProps}
      css={{
        bg: isDark ? "black" : "white",
        color: isDark ? "white" : "black",
      }}
    >
      {!external_only && body && <DynamicRender data={body as BlokItem[]} />}
    </Page>
  );
});
