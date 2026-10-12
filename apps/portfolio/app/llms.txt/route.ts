import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";

import { getAuthor, getSeoDefaults, getSiteConfig } from "@/lib/queries/config";
import { getSearchIndex } from "@/lib/queries/search-index";
import type { SearchDocument } from "@/lib/search/ranking";

/** Per-entry summary length; the file is an index, not a copy of the site. */
const EXCERPT_LIMIT = 200;

/**
 * https://llmstxt.org — a Markdown map of the site for language models,
 * built from the same corpus search and ask read.
 */
export async function GET() {
  let documents: SearchDocument[];
  try {
    documents = await getSearchIndex();
  } catch (error) {
    unstable_rethrow(error);
    captureServerException(error, { tags: { route: "llms.txt" } });
    // Request-time, so a build-time outage doesn't freeze the 503.
    await connection();
    return new Response("Index unavailable", { status: 503 });
  }

  const [site, seo, author] = await Promise.all([getSiteConfig(), getSeoDefaults(), getAuthor()]);
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  return new Response(buildLlmsTxt({ base, site, seo, author, documents }), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}

function buildLlmsTxt({
  base,
  site,
  seo,
  author,
  documents,
}: {
  base: string;
  site: Awaited<ReturnType<typeof getSiteConfig>>;
  seo: Awaited<ReturnType<typeof getSeoDefaults>>;
  author: Awaited<ReturnType<typeof getAuthor>>;
  documents: SearchDocument[];
}): string {
  const title = site.name || seo.title || base;
  const work = documents
    .filter((doc) => doc.kind === "work")
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const pages = documents.filter((doc) => doc.kind === "page");

  const lines = [`# ${title}`, ""];
  if (seo.description) {
    lines.push(`> ${oneLine(seo.description)}`, "");
  }
  if (author) {
    lines.push(`Portfolio of ${author.name}${author.url ? ` (${author.url})` : ""}.`, "");
  }
  if (work.length) {
    lines.push("## Work", "", ...work.map((doc) => entry(base, doc)), "");
  }
  if (pages.length) {
    lines.push("## Pages", "", ...pages.map((doc) => entry(base, doc)), "");
  }
  lines.push("## Optional", "", `- [Sitemap](${base}/sitemap.xml)`, "");
  return lines.join("\n");
}

function entry(base: string, doc: SearchDocument): string {
  const url = doc.href.startsWith("/") ? `${base}${doc.href}` : doc.href;
  const details = [doc.tags.length ? doc.tags.join(", ") : "", truncate(oneLine(doc.excerpt))]
    .filter(Boolean)
    .join(" — ");
  return `- [${oneLine(doc.title).replace(/[[\]]/g, "")}](${url})${details ? `: ${details}` : ""}`;
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string): string {
  return value.length > EXCERPT_LIMIT ? `${value.slice(0, EXCERPT_LIMIT - 1).trimEnd()}…` : value;
}
