import { type NextRequest, NextResponse } from "next/server";

import { mapiPath, studioAuth } from "../../../lib/mapi";

export const runtime = "nodejs";

interface PushPayload {
  slug: string;
  grid: { component: "grid"; _uid?: string; [key: string]: unknown };
  mode?: "append" | "replace";
  /** When mode = "replace", match the existing entry by `_uid` first, then by index. */
  replaceUid?: string;
  /** 0-based index into body[] used when mode = "replace" and no uid match found. */
  replaceIndex?: number;
}

interface StoryblokStory {
  id: number;
  full_slug: string;
  content: Record<string, unknown> & { body?: unknown[] };
}

export async function POST(request: NextRequest) {
  const auth = studioAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { token, spaceId } = auth;

  let payload: PushPayload;
  try {
    payload = (await request.json()) as PushPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!payload.slug || !payload.grid) {
    return NextResponse.json({ error: "Missing slug or grid" }, { status: 400 });
  }

  const headers = { Authorization: token, "content-type": "application/json" };

  const lookupUrl = `${mapiPath(spaceId, "/stories")}?with_slug=${encodeURIComponent(payload.slug)}`;
  const lookup = await fetch(lookupUrl, { headers, cache: "no-store" });
  if (!lookup.ok) {
    return NextResponse.json(
      { error: `Story lookup failed: ${lookup.status}` },
      { status: lookup.status },
    );
  }
  const { stories } = (await lookup.json()) as { stories: StoryblokStory[] };
  const story = stories?.[0];
  if (!story) {
    return NextResponse.json({ error: `No story with slug "${payload.slug}"` }, { status: 404 });
  }

  const detail = await fetch(mapiPath(spaceId, `/stories/${story.id}`), {
    headers,
    cache: "no-store",
  });
  if (!detail.ok) {
    return NextResponse.json(
      { error: `Story fetch failed: ${detail.status}` },
      { status: detail.status },
    );
  }
  const detailJson = (await detail.json()) as { story: StoryblokStory };
  const target = detailJson.story;

  const content = { ...target.content };
  const body = Array.isArray(content.body) ? [...content.body] : [];
  const mode = payload.mode ?? "append";

  let appliedAt = -1;
  let action: "appended" | "replaced" = "appended";

  if (mode === "replace") {
    let idx = -1;
    if (payload.replaceUid) {
      idx = body.findIndex((entry) => {
        const e = entry as { _uid?: string };
        return e?._uid === payload.replaceUid;
      });
    }
    if (idx < 0 && typeof payload.replaceIndex === "number") {
      if (payload.replaceIndex >= 0 && payload.replaceIndex < body.length) {
        idx = payload.replaceIndex;
      }
    }
    if (idx < 0) {
      return NextResponse.json(
        { error: "Replace target not found (no matching _uid and no valid replaceIndex)" },
        { status: 400 },
      );
    }
    // Preserve the existing entry's _uid so Storyblok treats this as an update,
    // not a brand-new blok (avoids losing _editable references in the Visual Editor).
    const existing = body[idx] as { _uid?: string };
    body[idx] = existing?._uid ? { ...payload.grid, _uid: existing._uid } : payload.grid;
    appliedAt = idx;
    action = "replaced";
  } else {
    body.push(payload.grid);
    appliedAt = body.length - 1;
  }

  content.body = body;

  const update = await fetch(mapiPath(spaceId, `/stories/${story.id}`), {
    method: "PUT",
    headers,
    body: JSON.stringify({ story: { ...target, content } }),
  });
  if (!update.ok) {
    const text = await update.text();
    return NextResponse.json(
      { error: `Update failed: ${update.status} ${text}` },
      { status: update.status },
    );
  }

  return NextResponse.json({
    ok: true,
    storyId: story.id,
    fullSlug: target.full_slug,
    action,
    index: appliedAt,
  });
}
