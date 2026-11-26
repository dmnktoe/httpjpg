import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { type NextRequest, NextResponse } from "next/server";

import { API_ERROR, jsonError } from "@/lib/api-error";
import { authorizeFeedRequest } from "@/lib/feed/auth";
import {
  buildEditedContent,
  editAssetIds,
  editedPostName,
  isPostSlug,
  type PostAsset,
  parseEditRequest,
  postAssets,
} from "@/lib/feed/publish";
import {
  deleteAsset,
  deleteStory,
  findStory,
  finishAssetUpload,
  getStory,
  isAssetUsedElsewhere,
  type MapiConfig,
  mapiConfig,
  type StoryDetail,
  updatePublishedStory,
} from "@/lib/integrations/storyblok-mapi";
import { enforceRateLimit } from "@/lib/rate-limit";
import { STORYBLOK_SLUGS } from "@/lib/storyblok-slugs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest, context: RouteContext) {
  const opened = await openPost(request, context);
  if (opened instanceof NextResponse) {
    return opened;
  }
  const { story } = opened;
  return NextResponse.json(
    { id: story.id, slug: story.fullSlug, url: `/${story.fullSlug}`, content: story.content },
    { headers: NO_STORE },
  );
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const opened = await openPost(request, context);
  if (opened instanceof NextResponse) {
    return opened;
  }
  const { config, story } = opened;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(API_ERROR.invalidJson, 400);
  }
  const parsed = parseEditRequest(body);
  if (!parsed.ok) {
    return jsonError(API_ERROR.invalidBody, 400, { message: parsed.message });
  }

  try {
    const assets = new Map<number, string>();
    for (const id of editAssetIds(parsed.value)) {
      assets.set(id, await finishAssetUpload(config, id));
    }
    const edited = buildEditedContent(story.content, parsed.value, assets);
    if (!edited.ok) {
      return jsonError(API_ERROR.invalidBody, 400, { message: edited.message });
    }
    const unused = await unusedAssets(config, edited.value.removed, story.id);
    const updated = await updatePublishedStory(config, story.id, {
      name: editedPostName(edited.value.content, story.name),
      content: edited.value.content,
    });
    await deleteAssets(config, unused);
    return NextResponse.json(
      { id: updated.id, slug: updated.fullSlug, url: `/${updated.fullSlug}` },
      { headers: NO_STORE },
    );
  } catch (error) {
    return upstreamFailure(error, "Storyblok did not accept the edit");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const opened = await openPost(request, context);
  if (opened instanceof NextResponse) {
    return opened;
  }
  const { config, story } = opened;

  try {
    const unused = await unusedAssets(config, postAssets(story.content), story.id);
    await deleteStory(config, story.id);
    await deleteAssets(config, unused);
    return NextResponse.json({ ok: true, assets: unused.length }, { headers: NO_STORE });
  } catch (error) {
    return upstreamFailure(error, "Storyblok did not delete the post");
  }
}

async function openPost(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse | { config: MapiConfig; story: StoryDetail }> {
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
  const { slug } = await context.params;
  if (!isPostSlug(slug)) {
    return jsonError(API_ERROR.notFound, 404);
  }
  try {
    const found = await findStory(config, `${STORYBLOK_SLUGS.FEED_PREFIX}${slug}`);
    if (!found) {
      return jsonError(API_ERROR.notFound, 404);
    }
    const story = await getStory(config, found.id);
    if (story.content.component !== "post") {
      return jsonError(API_ERROR.notFound, 404);
    }
    return { config, story };
  } catch (error) {
    return upstreamFailure(error, "Storyblok did not answer for the post");
  }
}

async function unusedAssets(
  config: MapiConfig,
  assets: PostAsset[],
  storyId: number,
): Promise<PostAsset[]> {
  const unused: PostAsset[] = [];
  for (const asset of assets) {
    const isUsed = await isAssetUsedElsewhere(config, asset.filename, storyId).catch(() => true);
    if (!isUsed) {
      unused.push(asset);
    }
  }
  return unused;
}

async function deleteAssets(config: MapiConfig, assets: PostAsset[]): Promise<void> {
  for (const asset of assets) {
    await deleteAsset(config, asset.id).catch((error: unknown) => {
      console.error("Feed asset cleanup failed:", error);
      captureServerException(error, { tags: { route: "feed-post", step: "asset-cleanup" } });
    });
  }
}

function upstreamFailure(error: unknown, message: string): NextResponse {
  console.error("Feed post request failed:", error);
  captureServerException(error, { tags: { route: "feed-post" } });
  return jsonError(API_ERROR.upstream, 502, { message });
}
