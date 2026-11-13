import { env } from "@httpjpg/env";
import type { MetadataRoute } from "next";

/**
 * Allows the image routes pages link to (share cards, nav favicons) so
 * crawlers that honour robots.txt (e.g. Twitterbot) can fetch them.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/og/", "/api/favicon"],
      disallow: ["/api/*", "/*?_draft=*", "/*?_storyblok=*", "/*?_storyblok_tk*"],
    },
    sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
