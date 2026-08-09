import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { fetchFavicon } from "@/lib/integrations/favicon";

export const runtime = "nodejs";

const MIN_SIZE = 16;
const MAX_SIZE = 256;
const DEFAULT_SIZE = 16;

const SUCCESS_CACHE = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
const MISS_CACHE = "public, max-age=3600, s-maxage=21600, stale-while-revalidate=3600";

const PLACEHOLDER = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=",
    "base64",
  ),
);

function placeholderResponse(status: number, reason: string): NextResponse {
  return new NextResponse(PLACEHOLDER, {
    status,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": MISS_CACHE,
      "X-Favicon-Status": reason,
    },
  });
}

function parseSize(value: string | null): number {
  const size = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(size)) {
    return DEFAULT_SIZE;
  }
  return Math.min(Math.max(size, MIN_SIZE), MAX_SIZE);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const url = searchParams.get("url");
  if (!url) {
    return placeholderResponse(400, "missing-url");
  }

  try {
    const result = await fetchFavicon(url, parseSize(searchParams.get("sz")));
    if (!result.ok) {
      return placeholderResponse(200, result.status === 400 ? "invalid-url" : "not-found");
    }

    const headers = new Headers({
      "Content-Type": result.contentType,
      "Cache-Control": SUCCESS_CACHE,
      "X-Content-Type-Options": "nosniff",
      "X-Favicon-Status": "hit",
    });

    if (result.contentType === "image/svg+xml") {
      headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'");
    }

    return new NextResponse(result.body, { status: 200, headers });
  } catch (error) {
    console.error("Favicon proxy error:", error);
    captureServerException(error, { tags: { route: "favicon" } });
    return placeholderResponse(200, "error");
  }
}
