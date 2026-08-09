import { fetchWithTimeout } from "./http";

interface LanyardAsset {
  small_image?: string;
  large_image?: string;
}

interface LanyardActivity {
  type: number;
  name?: string;
  state?: string;
  platform?: string;
  application_id?: string;
  emoji?: { name?: string };
  timestamps?: { start?: number };
  assets?: LanyardAsset;
}

interface LanyardUser {
  username?: string;
  avatar?: string;
}

interface LanyardPresence {
  discord_status?: "online" | "idle" | "dnd" | "offline";
  discord_user?: LanyardUser;
  activities?: LanyardActivity[];
}

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export type ActivitySummary =
  | {
      type: "game";
      name: string;
      platform: string | null;
      playtime: string | null;
      icon: string | null;
    }
  | { type: "custom"; text: string; emoji: string };

export interface DiscordPresenceSummary {
  status: DiscordStatus;
  activities: LanyardActivity[];
  activity: string | null;
  activityDetails: ActivitySummary | null;
  username: string | null;
  avatar: string | null;
}

const DISCORD_SNOWFLAKE = /^\d{17,20}$/;

export function isDiscordUserId(value: unknown): value is string {
  return typeof value === "string" && DISCORD_SNOWFLAKE.test(value);
}

function formatPlaytime(elapsedMs: number): string {
  const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function buildIconUrl(image: string, applicationId: string | undefined): string | null {
  if (image.startsWith("mp:external/")) {
    return `https://media.discordapp.net/external/${image.replace("mp:external/", "")}`;
  }
  if (image.startsWith("http")) {
    return image;
  }
  if (!applicationId) {
    return null;
  }
  return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`;
}

function extractActivity(activities: LanyardActivity[]): {
  label: string | null;
  details: ActivitySummary | null;
} {
  const gameActivity = activities.find((a) => a.type === 0 && a.name !== "Spotify");
  if (gameActivity?.name) {
    const gameName = gameActivity.name.replace(/™|®/g, "").trim();
    const platform = gameActivity.platform ? ` on ${gameActivity.platform.toUpperCase()}` : "";
    const playtime = gameActivity.timestamps?.start
      ? formatPlaytime(Date.now() - gameActivity.timestamps.start)
      : null;
    const iconSource = gameActivity.assets?.small_image ?? gameActivity.assets?.large_image;
    const icon = iconSource ? buildIconUrl(iconSource, gameActivity.application_id) : null;
    return {
      label: `Playing ${gameName}${platform}`,
      details: {
        type: "game",
        name: gameName,
        platform: gameActivity.platform ?? null,
        playtime,
        icon,
      },
    };
  }

  const customStatus = activities.find((a) => a.type === 4);
  if (customStatus?.state) {
    const emoji = customStatus.emoji?.name ?? "";
    return {
      label: emoji ? `${emoji} ${customStatus.state}` : customStatus.state,
      details: { type: "custom", text: customStatus.state, emoji },
    };
  }

  return { label: null, details: null };
}

export type LanyardFetchResult =
  | { ok: true; presence: DiscordPresenceSummary }
  | { ok: false; status: number; message: string };

export async function fetchDiscordPresence(userId: string): Promise<LanyardFetchResult> {
  const result = await fetchWithTimeout(
    `https://api.lanyard.rest/v1/users/${encodeURIComponent(userId)}`,
    {
      label: "Lanyard",
      hint: "Join discord.gg/lanyard to enable live status.",
    },
  );
  if (!result.ok) {
    return result;
  }

  const body = (await result.response.json()) as { data?: LanyardPresence };
  const presence = body?.data;
  if (!presence) {
    return { ok: false, status: 502, message: "Unexpected response from Lanyard API." };
  }
  const activities = presence.activities ?? [];
  const { label, details } = extractActivity(activities);

  return {
    ok: true,
    presence: {
      status: presence.discord_status ?? "offline",
      activities,
      activity: label,
      activityDetails: details,
      username: presence.discord_user?.username ?? null,
      avatar: presence.discord_user?.avatar
        ? `https://cdn.discordapp.com/avatars/${userId}/${presence.discord_user.avatar}.png`
        : null,
    },
  };
}
