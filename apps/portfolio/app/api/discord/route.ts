import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { SbConfigStory } from "@httpjpg/storyblok-ui";
import { draftMode } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { fetchDiscordPresence, isDiscordUserId } from "@/lib/integrations/discord";
import { enforceRateLimit } from "@/lib/rate-limit";

interface ResolvedUserId {
  userId?: string;
  configUnavailable: boolean;
}

async function resolveUserId(): Promise<ResolvedUserId> {
  try {
    const { isEnabled } = await draftMode();
    const story = await getStoryblokApi({ draftMode: isEnabled }).getStory({
      slug: "config",
    });
    if (!story) {
      return { configUnavailable: true };
    }
    const config = story.content as SbConfigStory | undefined;
    const userId = config?.discord_user_id;
    if (userId && !isDiscordUserId(userId)) {
      console.warn("Ignoring malformed discord_user_id from Storyblok config");
      return { configUnavailable: false };
    }
    return { userId, configUnavailable: false };
  } catch (error) {
    console.warn("Failed to fetch Discord config from Storyblok:", error);
    return { configUnavailable: true };
  }
}

export async function GET(request: NextRequest) {
  const limited = await enforceRateLimit(request);
  if (limited) {
    return limited;
  }

  try {
    const { userId, configUnavailable } = await resolveUserId();
    if (configUnavailable) {
      return NextResponse.json(
        {
          error: "Config unavailable",
          message: "Could not load the Storyblok config story",
        },
        { status: 503 },
      );
    }
    if (!userId) {
      return NextResponse.json(
        {
          error: "Discord User ID not configured",
          message: "Set discord_user_id in the Storyblok config story",
        },
        { status: 501 },
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
