"use client";

// TODO: Fix Storyblok component registration
// This component exists in code but throws "Component work-list doesn't exist" in CMS
// Need to run: pnpm --filter @httpjpg/storyblok-sync run sync
// Or manually create component in Storyblok dashboard

import { renderStoryblokRichText } from "@httpjpg/storyblok-richtext";
import { WorkList } from "@httpjpg/ui";
import { memo } from "react";
import { useStoryblokEditable } from "../../lib/use-storyblok-editable";

export interface SbWorkListProps {
  blok: {
    _uid: string;
    work?: Array<
      | string
      | {
          name: string;
          slug: string;
          full_slug: string;
          created_at: string;
          published_at?: string;
          first_published_at?: string;
          content?: {
            title?: string;
            description?: any;
            images?: Array<{
              filename: string;
              alt?: string;
              title?: string;
              copyright?: string;
              focus?: string;
            }>;
            date?: string;
            date_end?: string;
          };
        }
    >; // Array of story UUIDs or resolved stories
  };
  /**
   * Base URL for work links
   * @default "/work"
   */
  baseUrl?: string;
}

/**
 * Storyblok Work List Component
 * Displays a list of portfolio work items
 */
export const SbWorkList = memo(function SbWorkList({
  blok,
  baseUrl = "/work",
}: SbWorkListProps) {
  const editableProps = useStoryblokEditable(blok);
  const { work } = blok;

  // Filter out UUIDs and only keep resolved stories (objects)
  const workStories = (work || []).filter(
    (item): item is Exclude<typeof item, string> => typeof item === "object",
  );

  if (!workStories || workStories.length === 0) {
    return null;
  }

  // Transform Storyblok work data to WorkList format
  const workItems = workStories.map((item) => {
    // Use date_end if exists (for events/exhibitions with timespan),
    // otherwise use date field, fallback to first_published_at
    const dateString =
      item.content?.date_end ||
      item.content?.date ||
      item.first_published_at ||
      item.published_at ||
      item.created_at;

    // Render rich text description if available
    const description = item.content?.description
      ? renderStoryblokRichText(item.content.description)
      : undefined;

    return {
      id: item.slug,
      slug: item.slug,
      title: item.content?.title || item.name,
      description,
      images: (item.content?.images || []).map((img) => ({
        url: img.filename || "",
        alt: img.alt || item.content?.title || item.name,
        copyright: img.copyright,
        focus: img.focus,
      })),
      date: dateString,
      baseUrl,
    };
  });

  return (
    <div {...editableProps}>
      <WorkList works={workItems} />
    </div>
  );
});
