import { env } from "@httpjpg/env";
import { captureEdgeException } from "@httpjpg/observability/sentry/edge.ts";
import { getAccessToken, getCurrentlyPlaying } from "@httpjpg/spotify";
import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 0;

export async function GET() {
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
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  } catch (error) {
    console.error("Spotify API error:", error);
    captureEdgeException(error, { route: "spotify/now-playing" });
    return NextResponse.json(
      { error: "Failed to fetch now playing" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
