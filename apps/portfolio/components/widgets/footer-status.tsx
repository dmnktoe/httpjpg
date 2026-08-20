"use client";

import type { WidgetStatus } from "@/lib/queries/widget-status";
import { useWidgetData } from "@/lib/use-widget-data";

import { DiscogsStatus } from "./discogs-status";
import { type DiscordPresence, DiscordStatus } from "./discord-status";
import { LetterboxdStatus } from "./letterboxd-status";
import { TrophyStatus } from "./trophy-status";
import { XStatus } from "./x-status";

export interface FooterStatusProps {
  discordEnabled?: boolean;
  letterboxdEnabled?: boolean;
  discogsEnabled?: boolean;
  xEnabled?: boolean;
  trophiesEnabled?: boolean;
}

/** Presence changes minute to minute, so it is the one line worth polling. */
const DISCORD_POLL_MS = 30_000;

/**
 * Owns the footer status stack's data so the individual lines stay
 * presentational, the way CommandPalette and AskWidget are split.
 *
 * The slow-moving widgets share one request to /api/status; only Discord keeps
 * a connection of its own, because it is the only one that refreshes often
 * enough to be worth polling. Nothing is requested at all when the CMS has the
 * relevant widgets switched off.
 */
export function FooterStatus({
  discordEnabled = false,
  letterboxdEnabled = false,
  discogsEnabled = false,
  xEnabled = false,
  trophiesEnabled = false,
}: FooterStatusProps) {
  const wantsStatus = letterboxdEnabled || discogsEnabled || xEnabled || trophiesEnabled;

  const status = useWidgetData<WidgetStatus>("/api/status", { enabled: wantsStatus });
  const discord = useWidgetData<DiscordPresence>("/api/discord", {
    pollMs: DISCORD_POLL_MS,
    enabled: discordEnabled,
  });

  return (
    <>
      {discordEnabled && <DiscordStatus presence={discord.data} loaded={discord.loaded} />}
      {letterboxdEnabled && (
        <LetterboxdStatus
          film={status.data?.letterboxd?.films?.[0] ?? null}
          loaded={status.loaded}
        />
      )}
      {discogsEnabled && (
        <DiscogsStatus
          release={status.data?.discogs?.releases?.[0] ?? null}
          loaded={status.loaded}
        />
      )}
      {xEnabled && (
        <XStatus
          profile={status.data?.x?.profile ?? null}
          post={status.data?.x?.posts?.[0] ?? null}
          loaded={status.loaded}
        />
      )}
      {trophiesEnabled && (
        <TrophyStatus
          trophy={status.data?.trophies?.trophies?.[0] ?? null}
          avatar={status.data?.trophies?.avatar}
          loaded={status.loaded}
        />
      )}
    </>
  );
}
