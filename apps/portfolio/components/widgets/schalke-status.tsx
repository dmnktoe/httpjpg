"use client";

import { trackOutboundClick } from "@httpjpg/analytics";
import {
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";

import type { SchalkeStanding, SchalkeStatus as SchalkeData } from "@/lib/integrations/schalke";

export interface SchalkeStatusProps {
  status: SchalkeData | null;
  loaded: boolean;
}

export function SchalkeStatus({ status, loaded }: SchalkeStatusProps) {
  const fixture = status?.fixture ?? null;
  const standing = status?.standing ?? null;

  if (!status || (!fixture && !standing)) {
    return loaded ? null : <FooterStatusLine label="s04" loading />;
  }

  const score = fixture
    ? `${fixture.home} ${fixture.homeGoals}:${fixture.awayGoals} ${fixture.away}`
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
      {fixture && (
        <>
          <FooterStatusLineThumb
            src={`/images/football/${fixture.outcome}.png`}
            alt={fixture.outcome}
            size="2"
            shape="square"
            fit="contain"
            pixelated
          />
          <FooterStatusLineText>{score}</FooterStatusLineText>
        </>
      )}
      {fixture && standing && <FooterStatusLineSeparator />}
      {standing && (
        <>
          <FooterStatusLineThumb
            src={`/images/football/${standing.trend}.png`}
            alt={describeTrend(standing)}
            size="2"
            shape="square"
            fit="contain"
            pixelated
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

function describeTrend(standing: SchalkeStanding): string {
  if (standing.trend === "same" || standing.previousPosition === null) {
    return "unchanged";
  }
  return `${standing.trend} from ${standing.previousPosition}.`;
}
