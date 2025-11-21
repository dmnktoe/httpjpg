import { env } from "@httpjpg/env";
import type { MetadataRoute } from "next";

/**
 * Robots.txt configuration
 * Allows all crawlers and points to sitemap
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
