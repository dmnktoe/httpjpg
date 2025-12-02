/**
 * Next.js API Route: Spotify Now Playing
 *
 * GET /api/spotify/now-playing
 *
 * Returns currently playing track or null
 *
 * Environment Variables Required:
 * - SPOTIFY_CLIENT_ID
 * - SPOTIFY_CLIENT_SECRET
 * - SPOTIFY_REFRESH_TOKEN
 */

import { env } from "@httpjpg/env";
import { getAccessToken, getCurrentlyPlaying } from "@httpjpg/now-playing";
import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 0; // Don't cache

export async function GET() {
  try {
    // Get fresh access token
    const accessToken = await getAccessToken(
      env.SPOTIFY_CLIENT_ID,
      env.SPOTIFY_CLIENT_SECRET,
      env.SPOTIFY_REFRESH_TOKEN,
    );

    // Fetch currently playing
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
