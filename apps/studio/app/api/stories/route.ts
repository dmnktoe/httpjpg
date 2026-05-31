import { env } from "@httpjpg/env";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface StoryEntry {
  id: number;
  uuid: string;
  name: string;
  full_slug: string;
  slug: string;
  content_type?: string;
}

const MAPI = "https://mapi.storyblok.com/v1";

export async function GET(request: NextRequest) {
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
  const params = request.nextUrl.searchParams;
  const startsWith = params.get("starts_with") ?? "";
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? "1");
  const perPage = Math.min(50, Number(params.get("per_page") ?? "25"));

  const url = new URL(`${MAPI}/spaces/${spaceId}/stories`);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  url.searchParams.set("excluding_fields", "body");
  if (startsWith) url.searchParams.set("starts_with", startsWith);
  if (search) url.searchParams.set("search_term", search);

  const res = await fetch(url, {
    headers: { Authorization: token },
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: `Stories fetch failed: ${res.status}` },
      { status: res.status },
    );
  }
  const data = (await res.json()) as { stories: StoryEntry[]; total?: number };
  return NextResponse.json({
    ok: true,
    stories: data.stories ?? [],
    total: data.total ?? data.stories?.length ?? 0,
    page,
    perPage,
  });
}
