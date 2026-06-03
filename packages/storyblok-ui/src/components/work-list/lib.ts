import { renderStoryblokRichText } from "@httpjpg/storyblok-richtext";
import { type StoryblokImage, toSlideshowImage } from "@httpjpg/storyblok-utils";

export interface WorkStory {
  uuid?: string;
  name: string;
  slug: string;
  full_slug: string;
  tag_list?: string[];
  content?: {
    title?: string;
    description?: unknown;
    images?: StoryblokImage[];
    date?: string;
    date_end?: string;
  };
}

const BASE_URL = "/work";
const TAXONOMY_TAGS = new Set(["Projects", "Websites"]);

export function toWorkCardProps(story: WorkStory) {
  const title = story.content?.title || story.name;
  const tags = story.tag_list?.filter((t) => !TAXONOMY_TAGS.has(t));
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
    tags: tags?.length ? tags : undefined,
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
