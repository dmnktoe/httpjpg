import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { type NextRequest, NextResponse } from "next/server";

import { API_ERROR, jsonError } from "@/lib/api-error";
import { authorizeFeedRequest } from "@/lib/feed/auth";
import {
  buildPostContent,
  parsePublishRequest,
  postName,
  postSlug,
  publishAssetIds,
} from "@/lib/feed/publish";
import {
  createPublishedStory,
  ensureFolder,
  finishAssetUpload,
  mapiConfig,
} from "@/lib/integrations/storyblok-mapi";
import { getFeedPage } from "@/lib/queries/feed";
import { enforceRateLimit } from "@/lib/rate-limit";
import { STORYBLOK_SLUGS } from "@/lib/storyblok-slugs";

const MAX_PAGE = 500;

function parsePage(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.min(parsed, MAX_PAGE);
}

/** One page of the feed, for "load more". */
export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }
  const feed = await getFeedPage(parsePage(request.nextUrl.searchParams.get("page")));
  return NextResponse.json(feed, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}

/**
 * Publishes a post from uploads signed by `/api/feed/assets`. The feed shows
 * it once Storyblok's publish webhook has expired the story caches.
 */
export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }
  const denied = authorizeFeedRequest(request);
  if (denied) {
    return denied;
  }
  const config = mapiConfig();
  if (!config) {
    return jsonError(API_ERROR.notConfigured, 503, {
      message: "Storyblok management access is not configured on this deployment",
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(API_ERROR.invalidJson, 400);
  }
  const parsed = parsePublishRequest(body);
  if (!parsed.ok) {
    return jsonError(API_ERROR.invalidBody, 400, { message: parsed.message });
  }
  const post = parsed.value;
  const date = post.date ?? new Date();

  try {
    const assetIds = publishAssetIds(post);
    const filenames = await Promise.all(assetIds.map((id) => finishAssetUpload(config, id)));
    const assets = new Map(assetIds.map((id, index) => [id, filenames[index] as string]));
    const parentId = await ensureFolder(config, { slug: STORYBLOK_SLUGS.FEED, name: "Feed" });
    const story = await createPublishedStory(config, {
      name: postName(post, date),
      slug: postSlug(date),
      parentId,
      content: buildPostContent(post, assets, date),
    });
    return NextResponse.json(
      { id: story.id, slug: story.fullSlug, url: `/${story.fullSlug}` },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Feed publish failed:", error);
    captureServerException(error, { tags: { route: "feed-posts" } });
    return jsonError(API_ERROR.upstream, 502, { message: "Storyblok did not accept the post" });
  }
}
