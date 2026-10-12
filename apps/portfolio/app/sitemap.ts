import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { MetadataRoute } from "next";

import { LOCALIZED_SLUGS, localeAlternates, localizedPath } from "@/lib/locale";
import { collectStoryMedia } from "@/lib/search/story-media";
import { STORYBLOK_SLUGS } from "@/lib/storyblok-slugs";

interface SitemapStory {
  slug: string;
  full_slug: string;
  first_published_at: string | null;
  published_at: string | null;
  is_startpage: boolean;
  content?: { external_only?: boolean; images?: Array<{ filename?: string }> };
}

const PER_PAGE = 100;

/** Backstop against a paging bug walking the CDN forever. */
const MAX_PAGES = 20;

/** Image sitemap entries per URL; Google reads up to 1,000, a handful is plenty. */
const MAX_IMAGES_PER_URL = 10;

function storyImages(story: SitemapStory): string[] {
  const featured = (story.content?.images ?? [])
    .map((image) => image.filename)
    .filter((filename): filename is string => Boolean(filename));
  const inline = collectStoryMedia(story.content, MAX_IMAGES_PER_URL)
    .filter((media) => media.kind !== "audio")
    .map((media) => media.source)
    .filter((source): source is string => Boolean(source));
  return [...new Set([...featured, ...inline])].slice(0, MAX_IMAGES_PER_URL);
}

/**
 * Dynamic sitemap generation from Storyblok stories
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  const { getStories } = getStoryblokApi();

  // Internal pages that should not be in sitemap
  const EXCLUDED_SLUGS = ["config", "page-not-found"];

  try {
    // Paginated so stories past the first CDN page still get listed.
    const stories: SitemapStory[] = [];
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const response = await getStories({ per_page: PER_PAGE, page, version: "published" });
      stories.push(...((response.stories || []) as SitemapStory[]));
      const total = response.total ?? stories.length;
      if (stories.length >= total || page * (response.perPage || PER_PAGE) >= total) {
        break;
      }
    }

    let home: MetadataRoute.Sitemap[number] | undefined;

    const entries: MetadataRoute.Sitemap = stories
      .filter(
        (story): story is SitemapStory & { first_published_at: string } =>
          story.first_published_at !== null,
      ) // Only published
      .filter((story) => !story.is_startpage) // No folders
      .filter((story) => !EXCLUDED_SLUGS.includes(story.slug))
      .filter((story) => !story.content?.external_only)
      .flatMap((story) => {
        const lastModified = new Date(story.published_at || story.first_published_at);
        const images = storyImages(story);
        // `/home` renders the start page too; list it once, at the root.
        if (story.full_slug === STORYBLOK_SLUGS.HOME) {
          home = {
            url: baseUrl,
            lastModified,
            changeFrequency: "weekly",
            priority: 1,
            ...(images.length ? { images } : {}),
          };
          return [];
        }
        const changeFrequency = story.full_slug.startsWith("work/") ? "monthly" : "weekly";
        const languages = localeAlternates(story.full_slug);
        const alternates = languages
          ? {
              languages: Object.fromEntries(
                Object.entries(languages).map(([lang, path]) => [lang, `${baseUrl}${path}`]),
              ),
            }
          : undefined;
        const shared = {
          lastModified,
          changeFrequency: changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
          priority: 0.8,
          ...(alternates ? { alternates } : {}),
          ...(images.length ? { images } : {}),
        };
        const english: MetadataRoute.Sitemap[number] = {
          url: `${baseUrl}${localizedPath("en", story.full_slug)}`,
          ...shared,
        };
        if (!LOCALIZED_SLUGS.has(story.full_slug)) {
          return [english];
        }
        return [english, { url: `${baseUrl}${localizedPath("de", story.full_slug)}`, ...shared }];
      });

    // The root is always listed, even when the home story is missing.
    entries.unshift(
      home ?? { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    );

    return entries;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    captureServerException(error, { tags: { route: "sitemap" } });
    // Fallback to minimal sitemap
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }
}
