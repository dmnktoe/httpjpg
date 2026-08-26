import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { MetadataRoute } from "next";

import { LOCALIZED_SLUGS, localeAlternates, localizedPath } from "@/lib/locale";

interface SitemapStory {
  slug: string;
  full_slug: string;
  first_published_at: string | null;
  published_at: string | null;
  is_startpage: boolean;
  content?: { external_only?: boolean };
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
    // Use getStories with published version to get only published stories
    const response = await getStories({
      per_page: 100,
      version: "published",
    });

    const stories = (response.stories || []) as SitemapStory[];

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
          priority: story.full_slug === "home" ? 1 : 0.8,
          ...(alternates ? { alternates } : {}),
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

    // Add home page
    entries.unshift({
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    });

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
