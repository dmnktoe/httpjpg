import { getStoryblokApi } from "@httpjpg/storyblok-api";
import type { SbConfigStory } from "@httpjpg/storyblok-ui";
import { NextResponse } from "next/server";

/**
 * Discord Status API Route
 * Fetches Discord online status using Lanyard API
 *
 * Discord User ID sources (in priority order):
 * 1. Storyblok CMS config story (discord_user_id field)
 * 2. Environment variable (DISCORD_USER_ID)
 *
 * Uses Lanyard API: https://github.com/Phineas/lanyard
 */
export async function GET() {
  try {
    let userId: string | undefined;

    try {
      const storyblokApi = getStoryblokApi();
      const configStory = await storyblokApi.getStory({ slug: "config" });

      if (configStory?.content) {
        const config = configStory.content as SbConfigStory;
        if (config.discord_user_id) {
          userId = config.discord_user_id;
        }
      }
    } catch (error) {
      console.warn("Failed to fetch Discord config from Storyblok:", error);
    }

    if (!userId) {
      return NextResponse.json(
        {
          error: "Discord User ID not configured",
          message:
            "Set discord_user_id in Storyblok config or DISCORD_USER_ID in .env",
        },
        { status: 500 },
      );
    }

    // Fetch from Lanyard API (free Discord presence API)
    const response = await fetch(
      `https://api.lanyard.rest/v1/users/${userId}`,
      {
        cache: "no-store", // Don't cache in client components
      },
    );

    if (!response.ok) {
      // If 404, user needs to join Lanyard Discord bot
      // Return mock data instead of throwing error
      console.warn(
        `Lanyard API error: ${response.status} - User may need to join Lanyard bot`,
      );
      return NextResponse.json(
        {
          error: "Lanyard API unavailable",
          message: `Status ${response.status}. Join discord.gg/lanyard to enable live status.`,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    const presence = data.data;

    // Extract activity for display
    const activities = presence.activities || [];
    let activity = null;
    let activityDetails = null;

    // Priority 1: Gaming (type 0) - Skip Spotify (handled by separate Now Playing widget)
    const gameActivity = activities.find(
      (a: any) => a.type === 0 && a.name !== "Spotify",
    );
    if (gameActivity?.name) {
      const gameName = gameActivity.name.replace(/™|®/g, "").trim();
      const platform = gameActivity.platform
        ? ` on ${gameActivity.platform.toUpperCase()}`
        : "";
      activity = `Playing ${gameName}${platform}`;

      // Calculate playtime if timestamps exist
      let playtime = null;
      if (gameActivity.timestamps?.start) {
        const elapsed = Date.now() - gameActivity.timestamps.start;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        playtime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      }

      // Extract icon URL - handle both Discord assets and external URLs
      let iconUrl = null;
      const smallImage = gameActivity.assets?.small_image;
      const largeImage = gameActivity.assets?.large_image;

      if (smallImage) {
        iconUrl = smallImage.startsWith("mp:external/")
          ? `https://media.discordapp.net/external/${smallImage.replace("mp:external/", "")}`
          : smallImage.startsWith("http")
            ? smallImage
            : `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${smallImage}.png`;
      } else if (largeImage) {
        iconUrl = largeImage.startsWith("mp:external/")
          ? `https://media.discordapp.net/external/${largeImage.replace("mp:external/", "")}`
          : largeImage.startsWith("http")
            ? largeImage
            : `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${largeImage}.png`;
      }

      activityDetails = {
        name: gameName,
        platform: gameActivity.platform || null,
        playtime: playtime,
        icon: iconUrl,
        type: "game",
      };
    }
    // Priority 2: Custom Status (type 4) with emoji
    else {
      const customStatus = activities.find((a: any) => a.type === 4);
      if (customStatus?.state) {
        const emoji = customStatus.emoji?.name || "";
        activity = emoji
          ? `${emoji} ${customStatus.state}`
          : customStatus.state;

        activityDetails = {
          text: customStatus.state,
          emoji: emoji,
          type: "custom",
        };
      }
    }

    return NextResponse.json({
      status: presence.discord_status || "offline",
      activities: activities,
      activity: activity,
      activityDetails: activityDetails,
      username: presence.discord_user?.username || null,
      avatar: presence.discord_user?.avatar
        ? `https://cdn.discordapp.com/avatars/${userId}/${presence.discord_user.avatar}.png`
        : null,
    });
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
