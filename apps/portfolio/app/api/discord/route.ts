import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { SbConfigStory } from "@httpjpg/storyblok-ui";
import { type NextRequest, NextResponse } from "next/server";

import { fetchDiscordPresence, isDiscordUserId } from "@/lib/integrations/discord";
import { enforceRateLimit } from "@/lib/rate-limit";

// The DISCORD_USER_ID env var is declared in env.mjs but not consulted here;
// the source of truth is the Storyblok config story.
async function resolveUserId(): Promise<string | undefined> {
  try {
    const story = await getStoryblokApi().getStory({ slug: "config" });
    const config = story?.content as SbConfigStory | undefined;
    const userId = config?.discord_user_id;
    if (userId && !isDiscordUserId(userId)) {
      console.warn("Ignoring malformed discord_user_id from Storyblok config");
      return undefined;
    }
    return userId;
  } catch (error) {
    console.warn("Failed to fetch Discord config from Storyblok:", error);
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }

  try {
    const userId = await resolveUserId();
    if (!userId) {
      return NextResponse.json(
        {
          error: "Discord User ID not configured",
          message: "Set discord_user_id in Storyblok config or DISCORD_USER_ID in .env",
        },
        { status: 500 },
      );
    }

    const result = await fetchDiscordPresence(userId);
    if (!result.ok) {
      console.warn(`Lanyard API error: ${result.status} - User may need to join Lanyard bot`);
      return NextResponse.json(
        { error: "Lanyard API unavailable", message: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json(result.presence, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Discord API error:", error);
    captureServerException(error, { tags: { route: "discord" } });
    return NextResponse.json(
      {
        error: "Failed to fetch Discord status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
