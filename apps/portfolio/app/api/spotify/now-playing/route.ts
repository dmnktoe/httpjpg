import { env } from "@httpjpg/env";
import { captureEdgeException } from "@httpjpg/observability/sentry/edge.ts";
import {
  clearAccessTokenCache,
  getAccessToken,
  getCurrentlyPlaying,
  SpotifyForbiddenError,
  SpotifyUnauthorizedError,
} from "@httpjpg/spotify";
import { type NextRequest, NextResponse } from "next/server";

import { API_ERROR, jsonError } from "@/lib/api/errors";
import { jsonOk } from "@/lib/api/json";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "edge";
export const revalidate = 0;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

const UNAVAILABLE_CACHE_CONTROL = "public, s-maxage=600, stale-while-revalidate=1200";

export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }

  try {
    const nowPlaying = await fetchNowPlayingWithRetry();

    return jsonOk(
      { data: nowPlaying },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
          ...CORS_HEADERS,
        },
      },
    );
  } catch (error) {
    if (error instanceof SpotifyForbiddenError) {
      return jsonOk(
        { data: null, unavailable: "premium_missing", message: error.message },
        {
          headers: {
            "Cache-Control": UNAVAILABLE_CACHE_CONTROL,
            ...CORS_HEADERS,
          },
        },
      );
    }

    console.error("Spotify API error:", error);
    captureEdgeException(error, { route: "spotify/now-playing" });
    return jsonError(API_ERROR.internal, 500, {
      message: "Failed to fetch now playing",
      headers: CORS_HEADERS,
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

async function fetchNowPlayingWithRetry() {
  const accessToken = await getSpotifyAccessToken();
  try {
    return await getCurrentlyPlaying(accessToken);
  } catch (error) {
    if (!(error instanceof SpotifyUnauthorizedError)) {
      throw error;
    }
    clearAccessTokenCache();
    return getCurrentlyPlaying(await getSpotifyAccessToken());
  }
}

function getSpotifyAccessToken() {
  return getAccessToken(
    env.SPOTIFY_CLIENT_ID,
    env.SPOTIFY_CLIENT_SECRET,
    env.SPOTIFY_REFRESH_TOKEN,
  );
}
