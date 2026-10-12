import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { CMS_TAGS } from "@httpjpg/storyblok-next";
import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";

import { LOCALIZED_SLUGS, localeAlternates, localizedPath } from "@/lib/locale";

interface SitemapStory {
  slug: string;
  full_slug: string;
  first_published_at: string | null;
  published_at: string | null;
  is_startpage: boolean;
  content?: { external_only?: boolean };
}

const EXCLUDED_SLUGS = ["config", "page-not-found"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  try {
    return await readSitemap(baseUrl);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error generating sitemap:", error);
    captureServerException(error, { tags: { route: "sitemap" } });
    // Request-time, so a build-time outage doesn't freeze the fallback.
    await connection();
    return [{ url: baseUrl, changeFrequency: "weekly", priority: 1 }];
  }
}

async function readSitemap(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("cms");
  cacheTag(CMS_TAGS.stories);

  const response = await getStoryblokApi().getStories({
    per_page: 100,
    version: "published",
  });
  // An empty answer is an outage (`getStories` swallows errors): don't cache it.
  if (!response.stories?.length) {
    throw new Error("Storyblok returned no published stories for the sitemap");
  }

  const stories = response.stories as SitemapStory[];

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

  entries.unshift({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  });

  return entries;
}
