/**
 * Resolve work relations for SbWorkList component
 *
 * When using Stories field type in Storyblok, the API returns story UUIDs.
 * This helper resolves those UUIDs to full story data.
 *
 * @example
 * ```tsx
 * // In your page component:
 * import { resolveWorkRelations } from '@httpjpg/storyblok-ui';
 *
 * const story = await fetchStory(slug, {
 *   resolve_relations: 'work_list.work'
 * });
 *
 * const enrichedBody = resolveWorkRelations(story.content.body);
 * ```
 */

import type { SbBlokData } from "@storyblok/react/rsc";

interface WorkStory {
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  created_at: string;
  published_at?: string;
  first_published_at?: string;
  content: {
    component: string;
    title?: string;
    description?: any;
    images?: Array<{
      filename: string;
      alt?: string;
      title?: string;
    }>;
    date?: string;
  };
}

/**
 * Recursively resolve work relations in Storyblok content
 *
 * Storyblok API with resolve_relations returns resolved stories
 * in the `work` field instead of just UUIDs.
 */
export function resolveWorkRelations(
  blocks: SbBlokData[],
): Array<SbBlokData & { workStories?: WorkStory[] }> {
  return blocks.map((blok) => {
    // Check if this is a work_list component
    if (blok.component === "work_list" && Array.isArray(blok.work)) {
      // If work contains resolved stories (objects), extract them
      const workStories = blok.work
        .filter((item: any) => typeof item === "object" && item.uuid)
        .map((story: any) => ({
          uuid: story.uuid,
          name: story.name,
          slug: story.slug,
          full_slug: story.full_slug,
          created_at: story.created_at,
          published_at: story.published_at,
          first_published_at: story.first_published_at,
          content: story.content,
        }));

      return {
        ...blok,
        workStories,
      };
    }

    // Recursively process nested blocks
    if (blok.body && Array.isArray(blok.body)) {
      return {
        ...blok,
        body: resolveWorkRelations(blok.body),
      };
    }

    return blok;
  });
}
