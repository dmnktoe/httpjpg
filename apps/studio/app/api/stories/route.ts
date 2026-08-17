import { type NextRequest, NextResponse } from "next/server";

import { mapiPath, studioAuth } from "@/lib/mapi";

export const runtime = "nodejs";

interface StoryEntry {
  id: number;
  uuid: string;
  name: string;
  full_slug: string;
  slug: string;
  content_type?: string;
}

export async function GET(request: NextRequest) {
  const auth = studioAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { token, spaceId } = auth;
  const params = request.nextUrl.searchParams;
  const startsWith = params.get("starts_with") ?? "";
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? "1");
  const perPage = Math.min(50, Number(params.get("per_page") ?? "25"));

  const url = new URL(mapiPath(spaceId, "/stories"));
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
