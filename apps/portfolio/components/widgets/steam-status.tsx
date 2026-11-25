"use client";

import { trackOutboundClick } from "@httpjpg/analytics";
import {
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";

import { featuredSteamGame, type SteamStatus as SteamStatusData } from "@/lib/integrations/steam";

export interface SteamStatusProps {
  status: SteamStatusData | null;
  /** False while the request is in flight, so the line holds instead of collapsing. */
  loaded: boolean;
}

function formatPlaytime(minutes: number): string {
  return minutes < 60 ? `${minutes}m` : `${Math.round(minutes / 60)}h`;
}

export function SteamStatus({ status, loaded }: SteamStatusProps) {
  const game = status ? featuredSteamGame(status) : null;
  if (!status || !game) {
    return loaded ? null : <FooterStatusLine label="steam" loading />;
  }
  const isPlaying = status.profile.inGame?.appId === game.appId;

  return (
    <FooterStatusLine
      label="steam"
      href={game.url}
      onClick={() => trackOutboundClick({ destination: "steam", href: game.url, label: game.name })}
    >
      {game.icon && <FooterStatusLineThumb src={game.icon} />}
      <FooterStatusLineText>{game.name}</FooterStatusLineText>
      {isPlaying && (
        <FooterStatusLineText fixed aria-label="playing now" css={{ color: "accent.500" }}>
          ▶
        </FooterStatusLineText>
      )}
      {game.minutesTwoWeeks > 0 && (
        <>
          <FooterStatusLineSeparator />
          <FooterStatusLineText
            fixed
            dim
            aria-label={`${game.minutesTwoWeeks} minutes in the last two weeks`}
          >
            {formatPlaytime(game.minutesTwoWeeks)} / 2w
          </FooterStatusLineText>
        </>
      )}
    </FooterStatusLine>
  );
}
