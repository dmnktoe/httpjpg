import { env } from "@httpjpg/env";
import type { MetadataRoute } from "next";

/**
 * Robots.txt configuration
 *
 * Blocks:
 * - Draft mode URLs (_draft, _storyblok params)
 * - API routes
 * - Storyblok editor paths
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/*",
        "/*?_draft=*",
        "/*?_storyblok=*",
        "/*?_storyblok_tk*",
      ],
    },
    sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
