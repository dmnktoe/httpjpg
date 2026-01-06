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
              content_type?: string;
              is_external_url?: boolean;
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
    // Get start and end dates
    const startDate = item.content?.date;
    const endDate = item.content?.date_end;

    // For sorting/fallback: use end date if exists, otherwise start date, fallback to first_published_at
    const dateString =
      endDate ||
      startDate ||
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
      images: (item.content?.images || []).map((img) => {
        // Check content_type first (for Storyblok assets)
        const hasVideoContentType = img.content_type?.startsWith("video/");
        // Fallback: Check file extension (for external URLs)
        const hasVideoExtension = /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(
          img.filename || "",
        );
        const isVideo = hasVideoContentType || hasVideoExtension;

        return {
          url: isVideo ? "" : img.filename || "",
          alt: img.alt || item.content?.title || item.name,
          copyright: img.copyright,
          focus: img.focus,
          videoUrl: isVideo ? img.filename : undefined,
        };
      }),
      date: startDate,
      dateEnd: endDate,
      baseUrl,
    };
  });

  return (
    <div {...editableProps}>
      <WorkList works={workItems} />
    </div>
  );
});
