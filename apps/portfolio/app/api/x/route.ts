import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { SbConfigStory } from "@httpjpg/storyblok-ui";
import { type NextRequest, NextResponse } from "next/server";

import { fetchXTimeline, isXUsername } from "@/lib/integrations/x-posts";
import { enforceRateLimit } from "@/lib/rate-limit";

async function resolveUsername(): Promise<string | undefined> {
  try {
    const story = await getStoryblokApi().getStory({ slug: "config" });
    const config = story?.content as SbConfigStory | undefined;
    const username = config?.x_username;
    if (username && !isXUsername(username)) {
      console.warn("Ignoring malformed x_username from Storyblok config");
      return undefined;
    }
    return username;
  } catch (error) {
    console.warn("Failed to fetch X config from Storyblok:", error);
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }

  const apiKey = env.TWEETAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "X not configured", message: "Set TWEETAPI_KEY" },
      { status: 501 },
    );
  }

  try {
    const username = await resolveUsername();
    if (!username) {
      return NextResponse.json(
        {
          error: "X username not configured",
          message: "Set x_username in Storyblok config",
        },
        { status: 500 },
      );
    }

    const result = await fetchXTimeline({
      apiUrl: env.TWEETAPI_API_URL,
      apiKey,
      username,
    });

    if (!result.ok) {
      console.warn(`TweetAPI error: ${result.status} - ${result.message}`);
      return NextResponse.json(
        { error: "X unavailable", message: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json(result.timeline, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (error) {
    console.error("X API error:", error);
    captureServerException(error, { tags: { route: "x" } });
    return NextResponse.json({ error: "Failed to fetch X posts" }, { status: 500 });
  }
}
