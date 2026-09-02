import { type NextRequest, NextResponse } from "next/server";

import { mapiPath, studioAuth } from "../../../lib/mapi";

export const runtime = "nodejs";

interface AssetEntry {
  id: number;
  filename: string;
  alt?: string | null;
  title?: string | null;
  content_type?: string;
}

export async function GET(request: NextRequest) {
  const auth = studioAuth();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { token, spaceId } = auth;
  const params = request.nextUrl.searchParams;
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? "1");
  const perPage = Math.min(50, Number(params.get("per_page") ?? "24"));

  const url = new URL(mapiPath(spaceId, "/assets"));
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
