"use client";

import { Fragment, type ReactNode, useId, useState } from "react";
import { css } from "styled-system/css";

import { steamLine } from "@/lib/integrations/steam-game";
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
 * Lines shown before the rest fold behind the toggle. The stack is already
 * ordered live → newest → undated, so the first few are what is happening now.
 */
const VISIBLE_LINES = 3;

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

  const steam = status.data?.steam ? steamLine(status.data.steam) : null;
  const track = status.data?.lastfm?.tracks?.[0] ?? null;
  const schalke = status.data?.schalke ?? null;
  const schalkeDate = schalke?.fixture?.playedAt ?? schalke?.upcoming?.kickoff ?? null;

  const lines = [
    {
      key: "discord",
      enabled: discordEnabled,
      isLive: Boolean(discord.data?.status && discord.data.status !== "offline"),
      date: null,
      hasContent: true,
      node: <DiscordStatus presence={discord.data} loaded={discord.loaded} />,
    },
    {
      key: "letterboxd",
      enabled: letterboxdEnabled,
      isLive: false,
      date: status.data?.letterboxd?.films?.[0]?.watchedDate ?? null,
      hasContent: Boolean(status.data?.letterboxd?.films?.[0]),
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
      hasContent: Boolean(status.data?.discogs?.releases?.[0]),
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
      hasContent: Boolean(track),
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
      isLive: steam?.kind === "playing",
      date: steam?.game?.lastPlayedAt ?? null,
      hasContent: Boolean(steam),
      node: <SteamStatus status={status.data?.steam ?? null} loaded={status.loaded} />,
    },
    {
      key: "youtube",
      enabled: youtubeEnabled,
      isLive: false,
      date: status.data?.youtube?.videos?.[0]?.publishedAt ?? null,
      hasContent: Boolean(status.data?.youtube?.channel && status.data.youtube.videos?.[0]),
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
      hasContent: Boolean(status.data?.github?.profile && status.data.github.activity?.[0]),
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
      hasContent: Boolean(status.data?.reddit),
      node: <RedditStatus reddit={status.data?.reddit ?? null} loaded={status.loaded} />,
    },
    {
      key: "x",
      enabled: xEnabled,
      isLive: false,
      date: status.data?.x?.posts?.[0]?.createdAt ?? null,
      hasContent: Boolean(status.data?.x?.profile && status.data.x.posts?.[0]),
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
      hasContent: Boolean(status.data?.trophies?.trophies?.[0]),
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
      date: schalkeDate,
      hasContent: Boolean(schalke && (schalke.fixture || schalke.upcoming || schalke.standing)),
      node: <SchalkeStatus status={status.data?.schalke ?? null} loaded={status.loaded} />,
    },
  ];

  function isLoaded(key: string): boolean {
    return key === "discord" ? discord.loaded : status.loaded;
  }

  // A line whose source came back empty renders nothing, so it must not count
  // towards the visible few or the "more" tally. While loading, placeholders do
  // count: they hold the collapsed height so the footer does not jump.
  const shown = orderStatusLines(
    lines.filter((line) => line.enabled && (line.hasContent || !isLoaded(line.key))),
  );
  const head = shown.slice(0, VISIBLE_LINES);
  const rest = shown.slice(VISIBLE_LINES);

  return (
    <>
      {head.map((line) => (
        <Fragment key={line.key}>{line.node}</Fragment>
      ))}
      <FooterStatusMore count={rest.length}>
        {rest.map((line) => (
          <Fragment key={line.key}>{line.node}</Fragment>
        ))}
      </FooterStatusMore>
    </>
  );
}

interface FooterStatusMoreProps {
  count: number;
  children: ReactNode;
}

/** Folds the older lines behind an ASCII toggle, like the lightbox chrome. */
function FooterStatusMore({ count, children }: FooterStatusMoreProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = `footer-status-more-${useId().replace(/:/g, "")}`;

  if (count === 0) {
    return null;
  }

  return (
    <>
      <div id={panelId} hidden={!isExpanded} className={panelClass}>
        {children}
      </div>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={() => setIsExpanded((value) => !value)}
        className={toggleClass}
      >
        {isExpanded ? "[ − less ]" : `[ + ${count} more ]`}
      </button>
    </>
  );
}

const panelClass = css({ display: "contents" });

const toggleClass = css({
  minHeight: "5",
  px: "0",
  color: "inherit",
  opacity: 50,
  fontFamily: "mono",
  fontSize: "xs",
  bg: "transparent",
  border: "none",
  transitionProperty: "opacity",
  transitionDuration: "fast",
  cursor: "pointer",
  _hover: { opacity: 80 },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
});
