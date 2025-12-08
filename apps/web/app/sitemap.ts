import { env } from "@httpjpg/env";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { MetadataRoute } from "next";

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

    const stories = response.stories || [];

    const entries: MetadataRoute.Sitemap = stories
      .filter((story: any) => story.first_published_at !== null) // Only published
      .filter((story: any) => !story.is_startpage) // No folders
      .filter((story: any) => !EXCLUDED_SLUGS.includes(story.slug))
      .filter((story: any) => !story.slug.startsWith("console/")) // Exclude console pages
      .filter((story: any) => !story.content?.external_only) // Exclude external-only stories
      .map((story: any) => ({
        url: `${baseUrl}/${story.slug}`,
        lastModified: new Date(story.published_at || story.first_published_at),
        changeFrequency: story.slug.startsWith("work/") ? "monthly" : "weekly",
        priority: story.slug === "home" ? 1 : 0.8,
      }));

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
