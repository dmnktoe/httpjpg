import { env } from "@httpjpg/env";
import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { SbConfigStory } from "@httpjpg/storyblok-ui";
import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { widgetCacheHeaders } from "@/lib/cache-headers";
import { fetchXTimeline, isXUsername } from "@/lib/integrations/x-posts";
import { enforceRateLimit } from "@/lib/rate-limit";

async function resolveUsername(isDraft: boolean): Promise<string | undefined> {
  try {
    const story = await getStoryblokApi({ draftMode: isDraft }).getStory({
      slug: "config",
    });
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

  const { isEnabled: isDraft } = await draftMode();

  const apiKey = env.TWEETAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "X not configured", message: "Set TWEETAPI_KEY" },
      { status: 501 },
    );
  }

  try {
    const username = await resolveUsername(isDraft);
    if (!username) {
      return NextResponse.json(
        {
          error: "X username not configured",
          message: "Set x_username in Storyblok config",
        },
        { status: 501 },
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
      headers: widgetCacheHeaders(isDraft, 3600),
    });
  } catch (error) {
    console.error("X API error:", error);
    captureServerException(error, { tags: { route: "x" } });
    return NextResponse.json({ error: "Failed to fetch X posts" }, { status: 500 });
  }
}
