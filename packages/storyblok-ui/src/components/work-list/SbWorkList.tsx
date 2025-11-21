import { WorkList } from "@httpjpg/ui";
import { storyblokEditable } from "@storyblok/react/rsc";
import type { SbPageWorkProps } from "../page-work";

export interface SbWorkListProps {
  blok: {
    _uid: string;
    work?: Array<{
      name: string;
      slug: string;
      created_at: string;
      content?: SbPageWorkProps["blok"];
    }>;
  };
}

/**
 * Storyblok Work List Component
 * Displays a list of portfolio work items
 */
export function SbWorkList({ blok }: SbWorkListProps) {
  const { work } = blok;

  if (!work || work.length === 0) {
    return null;
  }

  // Transform Storyblok work data to WorkList format
  const workItems = work.map((item) => ({
    id: item.slug,
    slug: item.slug,
    title: item.content?.title || item.name,
    description: undefined, // Rich text rendering can be added later if needed
    images: (item.content?.images || []).map((img) => ({
      url: img.filename || "",
      alt: img.alt || item.content?.title || item.name,
    })),
    date: item.created_at,
  }));

  return (
    <div {...storyblokEditable(blok)}>
      <WorkList works={workItems} />
    </div>
  );
}
