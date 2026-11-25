"use client";

import { Fragment } from "react";

import { featuredSteamGame } from "@/lib/integrations/steam-game";
import type { WidgetStatus } from "@/lib/queries/widget-status";
import { orderStatusLines } from "@/lib/status-order";
import { useWidgetData } from "@/lib/use-widget-data";

import { DiscogsStatus } from "./discogs-status";
import { type DiscordPresence, DiscordStatus } from "./discord-status";
import { GithubStatus } from "./github-status";
import { LastfmStatus } from "./lastfm-status";
import { LetterboxdStatus } from "./letterboxd-status";
import { RedditStatus } from "./reddit-status";
import { SchalkeStatus } from "./schalke-status";
import { SteamStatus } from "./steam-status";
import { TrophyStatus } from "./trophy-status";
import { XStatus } from "./x-status";
import { YoutubeStatus } from "./youtube-status";

export interface FooterStatusProps {
  discordEnabled?: boolean;
  letterboxdEnabled?: boolean;
  discogsEnabled?: boolean;
  lastfmEnabled?: boolean;
  steamEnabled?: boolean;
  youtubeEnabled?: boolean;
  githubEnabled?: boolean;
  redditEnabled?: boolean;
  xEnabled?: boolean;
  trophiesEnabled?: boolean;
  schalkeEnabled?: boolean;
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
  lastfmEnabled = false,
  steamEnabled = false,
  youtubeEnabled = false,
  githubEnabled = false,
  redditEnabled = false,
  xEnabled = false,
  trophiesEnabled = false,
  schalkeEnabled = false,
}: FooterStatusProps) {
  const wantsStatus =
    letterboxdEnabled ||
    discogsEnabled ||
    lastfmEnabled ||
    steamEnabled ||
    youtubeEnabled ||
    githubEnabled ||
    redditEnabled ||
    xEnabled ||
    trophiesEnabled ||
    schalkeEnabled;

  const status = useWidgetData<WidgetStatus>("/api/status", { enabled: wantsStatus });
  const discord = useWidgetData<DiscordPresence>("/api/discord", {
    pollMs: DISCORD_POLL_MS,
    enabled: discordEnabled,
  });

  const steamGame = status.data?.steam ? featuredSteamGame(status.data.steam) : null;
  const track = status.data?.lastfm?.tracks?.[0] ?? null;
  const fixture = status.data?.schalke?.fixture ?? null;

  const lines = [
    {
      key: "discord",
      enabled: discordEnabled,
      isLive: Boolean(discord.data?.status && discord.data.status !== "offline"),
      date: null,
      node: <DiscordStatus presence={discord.data} loaded={discord.loaded} />,
    },
    {
      key: "letterboxd",
      enabled: letterboxdEnabled,
      isLive: false,
      date: status.data?.letterboxd?.films?.[0]?.watchedDate ?? null,
      node: (
        <LetterboxdStatus
          film={status.data?.letterboxd?.films?.[0] ?? null}
          loaded={status.loaded}
        />
      ),
    },
    {
      key: "discogs",
      enabled: discogsEnabled,
      isLive: false,
      date: status.data?.discogs?.releases?.[0]?.addedAt ?? null,
      node: (
        <DiscogsStatus
          release={status.data?.discogs?.releases?.[0] ?? null}
          loaded={status.loaded}
        />
      ),
    },
    {
      key: "lastfm",
      enabled: lastfmEnabled,
      isLive: track?.nowPlaying ?? false,
      date: track?.scrobbledAt ?? null,
      node: (
        <LastfmStatus
          track={track}
          total={status.data?.lastfm?.total ?? null}
          loaded={status.loaded}
        />
      ),
    },
    {
      key: "steam",
      enabled: steamEnabled,
      isLive: Boolean(steamGame && status.data?.steam?.profile.inGame?.appId === steamGame.appId),
      date: null,
      node: <SteamStatus status={status.data?.steam ?? null} loaded={status.loaded} />,
    },
    {
      key: "youtube",
      enabled: youtubeEnabled,
      isLive: false,
      date: status.data?.youtube?.videos?.[0]?.publishedAt ?? null,
      node: (
        <YoutubeStatus
          channel={status.data?.youtube?.channel ?? null}
          video={status.data?.youtube?.videos?.[0] ?? null}
          loaded={status.loaded}
        />
      ),
    },
    {
      key: "github",
      enabled: githubEnabled,
      isLive: false,
      date: status.data?.github?.activity?.[0]?.createdAt ?? null,
      node: (
        <GithubStatus
          profile={status.data?.github?.profile ?? null}
          activity={status.data?.github?.activity?.[0] ?? null}
          loaded={status.loaded}
        />
      ),
    },
    {
      key: "reddit",
      enabled: redditEnabled,
      isLive: false,
      date: null,
      node: <RedditStatus reddit={status.data?.reddit ?? null} loaded={status.loaded} />,
    },
    {
      key: "x",
      enabled: xEnabled,
      isLive: false,
      date: status.data?.x?.posts?.[0]?.createdAt ?? null,
      node: (
        <XStatus
          profile={status.data?.x?.profile ?? null}
          post={status.data?.x?.posts?.[0] ?? null}
          loaded={status.loaded}
        />
      ),
    },
    {
      key: "trophies",
      enabled: trophiesEnabled,
      isLive: false,
      date: status.data?.trophies?.trophies?.[0]?.earnedAt ?? null,
      node: (
        <TrophyStatus
          trophy={status.data?.trophies?.trophies?.[0] ?? null}
          avatar={status.data?.trophies?.avatar}
          loaded={status.loaded}
        />
      ),
    },
    {
      key: "schalke",
      enabled: schalkeEnabled,
      isLive: false,
      date: fixture?.playedAt ?? null,
      node: <SchalkeStatus status={status.data?.schalke ?? null} loaded={status.loaded} />,
    },
  ];

  return (
    <>
      {orderStatusLines(lines.filter((line) => line.enabled)).map((line) => (
        <Fragment key={line.key}>{line.node}</Fragment>
      ))}
    </>
  );
}
