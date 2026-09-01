import { renderStoryblokRichText } from "@httpjpg/storyblok-richtext";
import { type StoryblokImage, toSlideshowImage, workTagLabels } from "@httpjpg/storyblok-utils";

export interface WorkStory {
  uuid?: string;
  name: string;
  slug: string;
  full_slug: string;
  content?: {
    title?: string;
    description?: unknown;
    images?: StoryblokImage[];
    tags?: string[];
    date?: string;
    date_end?: string;
    accentColor?: string;
  };
}

const BASE_URL = "/work";

/**
 * Chips come from `content.tags`, the curated vocabulary — never from the
 * story's `tag_list`, which is the Projects/Websites taxonomy the header nav
 * sorts by and says nothing about what a work is.
 */
export function toWorkCardProps(story: WorkStory) {
  const title = story.content?.title || story.name;
  const tags = workTagLabels(story.content?.tags);
  return {
    slug: story.slug,
    title,
    description: story.content?.description
      ? renderStoryblokRichText(story.content.description as never)
      : undefined,
    images: (story.content?.images || []).map((img) => toSlideshowImage(img, title)),
    date: story.content?.date,
    dateEnd: story.content?.date_end,
    baseUrl: BASE_URL,
    tags: tags.length ? tags : undefined,
    accentColor: story.content?.accentColor,
  };
}

export function parseCols(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/**
 * Bridge `input` re-emits `work` as UUIDs after edits — cache resolved
 * objects so subsequent renders can rehydrate them by uuid.
 */
export function resolveStories(
  items: Array<string | WorkStory> | undefined,
  cache: Map<string, WorkStory>,
): WorkStory[] {
  if (!items) {
    return [];
  }
  const out: WorkStory[] = [];
  for (const item of items) {
    if (typeof item === "object" && item) {
      if (item.uuid) {
        cache.set(item.uuid, item);
      }
      out.push(item);
    } else if (typeof item === "string") {
      const cached = cache.get(item);
      if (cached) {
        out.push(cached);
      }
    }
  }
  return out;
}
