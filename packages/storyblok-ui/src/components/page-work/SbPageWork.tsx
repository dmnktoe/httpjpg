import { type BlokItem, DynamicRender } from "@httpjpg/storyblok-utils";
import { Page } from "@httpjpg/ui";
import { type SbBlokData, storyblokEditable } from "@storyblok/react/rsc";
import { memo } from "react";
import type { StoryblokImage } from "../../types";

/**
 * Work Page Component Props
 */
export interface SbPageWorkProps {
  blok: {
    _uid: string;
    body?: SbBlokData[];
    /**
     * Featured images for the work item
     * First image will be used as preview in navigation
     */
    images?: StoryblokImage[];
    /**
     * Optional title override
     */
    title?: string;
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
  const { body } = blok;

  return (
    <Page {...storyblokEditable(blok)}>
      {body && <DynamicRender data={body as BlokItem[]} />}
    </Page>
  );
});
