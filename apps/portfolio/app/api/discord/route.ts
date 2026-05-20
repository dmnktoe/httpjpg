import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { SbConfigStory } from "@httpjpg/storyblok-ui";
import { NextResponse } from "next/server";

import { fetchDiscordPresence } from "@/lib/integrations/discord";

// The DISCORD_USER_ID env var is declared in env.mjs but not consulted here;
// the source of truth is the Storyblok config story.
async function resolveUserId(): Promise<string | undefined> {
  try {
    const story = await getStoryblokApi().getStory({ slug: "config" });
    const config = story?.content as SbConfigStory | undefined;
    return config?.discord_user_id;
  } catch (error) {
    console.warn("Failed to fetch Discord config from Storyblok:", error);
    return undefined;
  }
}

export async function GET() {
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

    return NextResponse.json(result.presence);
  } catch (error) {
    console.error("Discord API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Discord status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
