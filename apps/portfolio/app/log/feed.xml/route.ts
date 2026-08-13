import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";

import { type ActivityEntry, getActivitySources, mergeActivity } from "@/lib/queries/activity";
import { getFeatureFlags } from "@/lib/queries/widgets";

const FEED_TITLE = "httpjpg / log";
const FEED_DESCRIPTION = "Work, films, records and trophies — newest first.";

const LIMIT = 50;

const KIND_LABEL = {
  work: "Published",
  film: "Watched",
  record: "Added",
  trophy: "Earned",
} as const;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const flags = await getFeatureFlags();
  if (!flags.rssFeedEnabled) {
    return new Response("RSS feed disabled", { status: 404 });
  }

  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  let entries: ActivityEntry[];
  try {
    entries = mergeActivity(await getActivitySources(), LIMIT);
  } catch (error) {
    console.error("Activity feed generation failed:", error);
    captureServerException(error, { tags: { route: "log-feed" } });
    return new Response("Upstream error", { status: 502 });
  }

  const items = entries.map((entry) => toItem(entry, base)).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${base}/log</link>
    <atom:link href="${base}/log/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900, stale-while-revalidate=1800",
    },
  });
}

function toItem(entry: ActivityEntry, base: string): string {
  const link = entry.href
    ? entry.href.startsWith("/")
      ? `${base}${entry.href}`
      : entry.href
    : `${base}/log`;
  const guid = entry.href ? link : `${base}/log#${entry.id}`;
  const description = [KIND_LABEL[entry.kind], entry.detail].filter(Boolean).join(" · ");
  const enclosure = entry.thumb
    ? `\n      <enclosure url="${escapeXml(entry.thumb)}" type="image/jpeg"/>`
    : "";

  return `    <item>
      <title>${escapeXml(`${KIND_LABEL[entry.kind]}: ${entry.title}`)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="${entry.href ? "true" : "false"}">${escapeXml(guid)}</guid>
      <pubDate>${new Date(entry.date).toUTCString()}</pubDate>
      <category>${escapeXml(entry.kind)}</category>
      <description>${escapeXml(description)}</description>${enclosure}
    </item>`;
}
