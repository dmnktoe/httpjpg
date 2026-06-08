import { env } from "@httpjpg/env";
import { captureEdgeException } from "@httpjpg/observability/sentry/edge.ts";
import { getAccessToken, getCurrentlyPlaying, SpotifyForbiddenError } from "@httpjpg/spotify";
import { type NextRequest, NextResponse } from "next/server";

import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "edge";
export const revalidate = 0;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }

  try {
    const accessToken = await getAccessToken(
      env.SPOTIFY_CLIENT_ID,
      env.SPOTIFY_CLIENT_SECRET,
      env.SPOTIFY_REFRESH_TOKEN,
    );

    const nowPlaying = await getCurrentlyPlaying(accessToken);

    return NextResponse.json(
      { data: nowPlaying },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
          ...CORS_HEADERS,
        },
      },
    );
  } catch (error) {
    // Missing Premium is an expected account state, not a bug — surface a danger
    // 500 to the widget but don't page Sentry.
    if (error instanceof SpotifyForbiddenError) {
      console.warn("Spotify playback forbidden:", error.message);
      return NextResponse.json(
        { error: "premium_missing", message: error.message },
        { status: 500, headers: CORS_HEADERS },
      );
    }

    console.error("Spotify API error:", error);
    captureEdgeException(error, { route: "spotify/now-playing" });
    return NextResponse.json(
      { error: "internal_error", message: "Failed to fetch now playing" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}
