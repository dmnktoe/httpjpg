import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface StoryblokStory {
  id: number;
  full_slug: string;
  content?: Record<string, unknown> & { body?: unknown[] };
}

const MAPI = "https://mapi.storyblok.com/v1";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const token = process.env.STORYBLOK_MANAGEMENT_TOKEN;
  const spaceId = process.env.STORYBLOK_SPACE_ID;
  if (!token || !spaceId) {
    return NextResponse.json(
      { error: "STORYBLOK_MANAGEMENT_TOKEN or STORYBLOK_SPACE_ID not set" },
      { status: 500 },
    );
  }
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const headers = { Authorization: token };

  const lookup = await fetch(
    `${MAPI}/spaces/${spaceId}/stories?with_slug=${encodeURIComponent(slug)}`,
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

  const detail = await fetch(`${MAPI}/spaces/${spaceId}/stories/${story.id}`, {
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
