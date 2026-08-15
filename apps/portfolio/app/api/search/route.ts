import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { type NextRequest, NextResponse } from "next/server";

import { getSearchIndex } from "@/lib/queries/search-index";
import { enforceRateLimit } from "@/lib/rate-limit";
import { rankDocuments, suggestCompletions } from "@/lib/search/ranking";
import { resolveTagBrowseIntent } from "@/lib/search/tag-intent";

const MAX_QUERY_LENGTH = 120;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;

function parseLimit(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }

  const query = (request.nextUrl.searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH).trim();
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));

  if (!query) {
    return NextResponse.json({ results: [], suggestions: [] });
  }

  try {
    const documents = await getSearchIndex();
    const ranked = rankDocuments(documents, query, limit);
    const tagIntent = resolveTagBrowseIntent(query);
    const results = tagIntent
      ? [
          {
            id: `tag:${tagIntent.tag.value}`,
            href: tagIntent.href,
            title: tagIntent.title,
            kind: "page" as const,
            tags: [tagIntent.tag.label],
            excerpt: `Filter the work list by ${tagIntent.tag.label}`,
            score: Number.MAX_SAFE_INTEGER,
          },
          ...ranked.filter((result) => result.href !== tagIntent.href),
        ].slice(0, limit)
      : ranked;

    return NextResponse.json(
      {
        results,
        suggestions: suggestCompletions(documents, query),
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("Search API error:", error);
    captureServerException(error, { tags: { route: "search" } });
    return NextResponse.json({ error: "Search unavailable" }, { status: 500 });
  }
}
