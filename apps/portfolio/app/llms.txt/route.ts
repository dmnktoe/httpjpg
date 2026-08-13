import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";

import { getSeoDefaults } from "@/lib/queries/config";
import { getSearchIndex } from "@/lib/queries/search-index";
import type { SearchDocument } from "@/lib/search/ranking";

const SUMMARY_LENGTH = 160;

export async function GET() {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  let documents: SearchDocument[];
  let seo: Awaited<ReturnType<typeof getSeoDefaults>>;
  try {
    [documents, seo] = await Promise.all([getSearchIndex(), getSeoDefaults()]);
  } catch (error) {
    console.error("llms.txt generation failed:", error);
    captureServerException(error, { tags: { route: "llms-txt" } });
    return new Response("Upstream error\n", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const onSite = documents.filter((document) => document.href.startsWith("/"));
  const work = onSite.filter((document) => document.kind === "work").sort(byDateDesc);
  const pages = onSite.filter((document) => document.kind !== "work").sort(byTitle);

  const lines: string[] = [`# ${seo.title || "httpjpg"}`, ""];
  if (seo.description) {
    lines.push(`> ${seo.description}`, "");
  }
  lines.push(
    "Every page below is also available as Markdown at the same path with a `.md` suffix.",
    "",
  );

  if (work.length > 0) {
    lines.push("## Work", "", ...work.map((document) => entry(document, base)), "");
  }
  if (pages.length > 0) {
    lines.push("## Pages", "", ...pages.map((document) => entry(document, base)), "");
  }

  lines.push(
    "## Feeds",
    "",
    `- [Work RSS](${base}/work/feed.xml): the work list as an RSS feed.`,
    `- [Activity RSS](${base}/log/feed.xml): records, films, trophies and published work, newest first.`,
    "",
  );

  return new Response(`${lines.join("\n").trimEnd()}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}

function entry(document: SearchDocument, base: string): string {
  const markdownUrl = `${base}${document.href === "/" ? "/index" : document.href}.md`;
  const parts: string[] = [];

  if (document.date) {
    parts.push(document.date.slice(0, 4));
  }
  if (document.tags.length > 0) {
    parts.push(document.tags.join(", "));
  }
  const excerpt = summarize(document.excerpt);
  if (excerpt) {
    parts.push(excerpt);
  }

  const suffix = parts.length > 0 ? `: ${parts.join(" — ")}` : "";
  return `- [${document.title}](${markdownUrl})${suffix}`;
}

function summarize(excerpt: string): string {
  const text = excerpt.replace(/\s+/g, " ").trim();
  if (text.length <= SUMMARY_LENGTH) {
    return text;
  }
  return `${text.slice(0, SUMMARY_LENGTH).trimEnd()}…`;
}

function byDateDesc(a: SearchDocument, b: SearchDocument): number {
  return (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title);
}

function byTitle(a: SearchDocument, b: SearchDocument): number {
  return a.title.localeCompare(b.title);
}
