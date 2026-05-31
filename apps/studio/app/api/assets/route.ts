import { env } from "@httpjpg/env";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface AssetEntry {
  id: number;
  filename: string;
  alt?: string | null;
  title?: string | null;
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
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? "1");
  const perPage = Math.min(50, Number(params.get("per_page") ?? "24"));

  const url = new URL(`${MAPI}/spaces/${spaceId}/assets`);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  if (search) url.searchParams.set("search", search);

  const res = await fetch(url, {
    headers: { Authorization: token },
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: `Assets fetch failed: ${res.status}` },
      { status: res.status },
    );
  }
  const data = (await res.json()) as { assets: AssetEntry[]; total?: number };
  return NextResponse.json({
    ok: true,
    assets: data.assets ?? [],
    total: data.total ?? data.assets?.length ?? 0,
    page,
    perPage,
  });
}
