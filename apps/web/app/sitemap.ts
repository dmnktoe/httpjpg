import { env } from "@httpjpg/env";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { MetadataRoute } from "next";

/**
 * Dynamic sitemap generation from Storyblok stories
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  const { getAllSlugs } = getStoryblokApi();

  try {
    const slugs = await getAllSlugs({ starts_with: "" });

    const entries: MetadataRoute.Sitemap = slugs
      .filter((item) => !item.isFolder)
      .map((item) => ({
        url: `${baseUrl}/${item.slug}`,
        lastModified: new Date(),
        changeFrequency: item.slug.startsWith("work/") ? "monthly" : "weekly",
        priority: item.slug === "home" ? 1 : 0.8,
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
