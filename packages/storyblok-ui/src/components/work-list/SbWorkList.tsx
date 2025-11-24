import { renderStoryblokRichText } from "@httpjpg/storyblok-richtext";
import { WorkList } from "@httpjpg/ui";
import { storyblokEditable } from "@storyblok/react/rsc";
import { memo } from "react";

export interface SbWorkListProps {
  blok: {
    _uid: string;
    work?: Array<{
      name: string;
      slug: string;
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
        }>;
        date?: string;
      };
    }>;
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
  const { work } = blok;

  if (!work || work.length === 0) {
    return null;
  }

  // Transform Storyblok work data to WorkList format
  const workItems = work.map((item) => {
    // Try to use custom date field first, then published_at, then first_published_at as fallback
    const dateString =
      item.content?.date ||
      item.published_at ||
      item.first_published_at ||
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
      })),
      date: dateString,
      baseUrl,
    };
  });

  return (
    <div {...storyblokEditable(blok)}>
      <WorkList works={workItems} />
    </div>
  );
});
