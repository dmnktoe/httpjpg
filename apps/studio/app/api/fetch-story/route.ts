import { type NextRequest, NextResponse } from "next/server";

import { mapiPath, studioAuth } from "@/lib/mapi";

export const runtime = "nodejs";

interface StoryblokStory {
  id: number;
  full_slug: string;
  content?: Record<string, unknown> & { body?: unknown[] };
}

export async function GET(request: NextRequest) {
  const auth = studioAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { token, spaceId } = auth;
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const headers = { Authorization: token };

  const lookup = await fetch(
    `${mapiPath(spaceId, "/stories")}?with_slug=${encodeURIComponent(slug)}`,
    { headers, cache: "no-store" },
  );
  if (!lookup.ok) {
    return NextResponse.json(
      { error: `Lookup failed: ${lookup.status}` },
      { status: lookup.status },
    );
  }
  const { stories } = (await lookup.json()) as { stories: StoryblokStory[] };
  const story = stories?.[0];
  if (!story) {
    return NextResponse.json({ error: `No story with slug "${slug}"` }, { status: 404 });
  }

  const detail = await fetch(mapiPath(spaceId, `/stories/${story.id}`), {
    headers,
    cache: "no-store",
  });
  if (!detail.ok) {
    return NextResponse.json(
      { error: `Fetch failed: ${detail.status}` },
      { status: detail.status },
    );
  }
  const detailJson = (await detail.json()) as { story: StoryblokStory };
  return NextResponse.json({ ok: true, story: detailJson.story });
}
