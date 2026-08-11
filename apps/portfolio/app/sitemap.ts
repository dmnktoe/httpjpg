import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { MetadataRoute } from "next";

interface SitemapStory {
  slug: string;
  full_slug: string;
  first_published_at: string | null;
  published_at: string | null;
  is_startpage: boolean;
  content?: { external_only?: boolean };
}

const CODE_ROUTES = [
  { path: "/now", changeFrequency: "daily" as const, priority: 0.6 },
  { path: "/log", changeFrequency: "daily" as const, priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  const { getStories } = getStoryblokApi();

  const codeEntries: MetadataRoute.Sitemap = CODE_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const EXCLUDED_SLUGS = ["config", "page-not-found"];

  try {
    const response = await getStories({
      per_page: 100,
      version: "published",
    });

    const stories = (response.stories || []) as SitemapStory[];

    const entries: MetadataRoute.Sitemap = stories
      .filter(
        (story): story is SitemapStory & { first_published_at: string } =>
          story.first_published_at !== null,
      )
      .filter((story) => !story.is_startpage)
      .filter((story) => !EXCLUDED_SLUGS.includes(story.slug))
      .filter((story) => !story.content?.external_only)
      .map((story) => ({
        url: `${baseUrl}/${story.full_slug}`,
        lastModified: new Date(story.published_at || story.first_published_at),
        changeFrequency: story.full_slug.startsWith("work/") ? "monthly" : "weekly",
        priority: story.full_slug === "home" ? 1 : 0.8,
      }));

    entries.unshift({
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    });

    return [...entries, ...codeEntries];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    captureServerException(error, { tags: { route: "sitemap" } });
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      ...codeEntries,
    ];
  }
}
