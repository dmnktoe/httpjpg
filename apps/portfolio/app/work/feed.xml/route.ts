import { env } from "@httpjpg/env";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import { extractPlainText, firstImageFilename, imagePreset } from "@httpjpg/storyblok-utils";
import { unstable_cache } from "next/cache";

import { getFeatureFlags } from "@/lib/queries/widgets";

interface FeedStory {
  slug: string;
  full_slug?: string;
  name?: string;
  published_at?: string;
  first_published_at?: string;
  content?: {
    title?: string;
    description?: unknown;
    images?: Array<{ filename?: string; content_type?: string }>;
    date?: string;
  };
}

const FEED_TITLE = "httpjpg / work";
const FEED_DESCRIPTION = "Latest work — httpjpg portfolio";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const fetchWorkStories = unstable_cache(
  async (): Promise<FeedStory[]> => {
    const res = await getStoryblokApi({ draftMode: false }).getStories({
      starts_with: "work/",
      per_page: 50,
      sort_by: "content.date:desc",
      version: "published",
    });
    return (res.stories ?? []) as FeedStory[];
  },
  ["work-feed"],
  { revalidate: 3600 },
);

export async function GET() {
  const flags = await getFeatureFlags();
  if (!flags.rssFeedEnabled) {
    return new Response("RSS feed disabled", { status: 404 });
  }

  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const stories = (await fetchWorkStories()).filter((s) => {
    const full = s.full_slug || s.slug;
    const rest = full.replace(/^work\//, "");
    return rest && !rest.includes("/");
  });

  const items = stories
    .map((s) => {
      const title = escapeXml(s.content?.title || s.name || s.slug);
      const link = `${base}/work/${s.slug}`;
      const pubDate = new Date(
        s.content?.date || s.published_at || s.first_published_at || Date.now(),
      ).toUTCString();
      const desc = escapeXml(extractPlainText(s.content?.description as never, 500));
      const img = firstImageFilename(s.content?.images);
      const enclosure = img
        ? `\n      <enclosure url="${escapeXml(imagePreset.og(img))}" type="image/jpeg"/>`
        : "";
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${desc}</description>${enclosure}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${base}/work</link>
    <atom:link href="${base}/work/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>de</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
