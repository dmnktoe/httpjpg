import { env } from "@httpjpg/env";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface PushPayload {
  slug: string;
  grid: { component: "grid"; [key: string]: unknown };
}

interface StoryblokStory {
  id: number;
  full_slug: string;
  content: Record<string, unknown> & { body?: unknown[] };
}

const MAPI = "https://mapi.storyblok.com/v1";

export async function POST(request: NextRequest) {
  if (env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const token = env.STORYBLOK_MANAGEMENT_TOKEN;
  const spaceId = env.STORYBLOK_SPACE_ID;
  if (!token || !spaceId) {
    return NextResponse.json(
      { error: "STORYBLOK_MANAGEMENT_TOKEN or STORYBLOK_SPACE_ID not set" },
      { status: 500 },
    );
  }

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

  const lookupUrl = `${MAPI}/spaces/${spaceId}/stories?with_slug=${encodeURIComponent(payload.slug)}`;
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

  const detail = await fetch(`${MAPI}/spaces/${spaceId}/stories/${story.id}`, {
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
  body.push(payload.grid);
  content.body = body;

  const update = await fetch(`${MAPI}/spaces/${spaceId}/stories/${story.id}`, {
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

  return NextResponse.json({ ok: true, storyId: story.id, fullSlug: target.full_slug });
}
