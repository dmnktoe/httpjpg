"use client";

import { trackOutboundClick } from "@httpjpg/analytics";
import {
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";

import type {
  SchalkeStanding,
  SchalkeStatus as SchalkeData,
  SchalkeUpcoming,
} from "@/lib/integrations/schalke";

export interface SchalkeStatusProps {
  status: SchalkeData | null;
  loaded: boolean;
}

export function SchalkeStatus({ status, loaded }: SchalkeStatusProps) {
  const fixture = status?.fixture ?? null;
  const upcoming = status?.upcoming ?? null;
  const standing = status?.standing ?? null;
  const match = fixture ?? upcoming;

  if (!status || (!match && !standing)) {
    return loaded ? null : <FooterStatusLine label="s04" loading />;
  }

  const score = fixture
    ? `${fixture.home} ${fixture.homeGoals}:${fixture.awayGoals} ${fixture.away}`
    : upcoming
      ? `${upcoming.home} – ${upcoming.away}`
      : null;

  return (
    <FooterStatusLine
      label="s04"
      href={status.url}
      onClick={() =>
        trackOutboundClick({
          destination: "schalke",
          href: status.url,
          label: score ?? `${standing?.position}.`,
        })
      }
    >
      {match && (
        <>
          {match.homeCrest && (
            <FooterStatusLineThumb src={match.homeCrest} size="4" shape="square" fit="contain" />
          )}
          <FooterStatusLineText>{score}</FooterStatusLineText>
          {match.awayCrest && (
            <FooterStatusLineThumb src={match.awayCrest} size="4" shape="square" fit="contain" />
          )}
          {upcoming && (
            <FooterStatusLineText fixed dim>
              {describeKickoff(upcoming)}
            </FooterStatusLineText>
          )}
        </>
      )}
      {match && standing && <FooterStatusLineSeparator />}
      {standing && (
        <>
          <FooterStatusLineThumb
            src={`/images/football/${standing.trend}.png`}
            alt={describeTrend(standing)}
            size="2"
            shape="square"
            fit="contain"
          />
          <FooterStatusLineText fixed>{standing.position}.</FooterStatusLineText>
          <FooterStatusLineText fixed dim>
            {standing.points} pts
          </FooterStatusLineText>
        </>
      )}
    </FooterStatusLine>
  );
}

function describeKickoff(upcoming: SchalkeUpcoming): string {
  const now = Date.now();
  const kickoff = Date.parse(upcoming.kickoff);
  if (kickoff <= now) {
    return "live";
  }
  const time = KICKOFF_TIME.format(kickoff);
  if (kickoff - now < KICKOFF_WEEKDAY_WINDOW_MS) {
    return `${KICKOFF_WEEKDAY.format(kickoff)} ${time}`;
  }
  return `${KICKOFF_DATE.format(kickoff)} ${time}`;
}

function describeTrend(standing: SchalkeStanding): string {
  if (standing.trend === "same" || standing.previousPosition === null) {
    return "unchanged";
  }
  return `${standing.trend} from ${standing.previousPosition}.`;
}

const KICKOFF_WEEKDAY_WINDOW_MS = 6 * 24 * 60 * 60 * 1000;

const KICKOFF_ZONE = "Europe/Berlin";
const KICKOFF_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: KICKOFF_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});
const KICKOFF_WEEKDAY = new Intl.DateTimeFormat("en-GB", {
  timeZone: KICKOFF_ZONE,
  weekday: "short",
});
const KICKOFF_DATE = new Intl.DateTimeFormat("en-GB", {
  timeZone: KICKOFF_ZONE,
  day: "numeric",
  month: "short",
});
