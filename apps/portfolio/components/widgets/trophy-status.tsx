"use client";

import {
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";

import type { PsnTrophy } from "@/lib/integrations/psn-trophies";

export interface TrophyStatusProps {
  trophy: PsnTrophy | null;
  avatar?: string | null;
  /** False while the request is in flight, so the line holds instead of collapsing. */
  loaded: boolean;
}

export function TrophyStatus({ trophy, avatar, loaded }: TrophyStatusProps) {
  if (!trophy) {
    return loaded ? null : <FooterStatusLine loading />;
  }

  return (
    <FooterStatusLine href={trophy.url}>
      {avatar && <FooterStatusLineThumb src={avatar} size="4" shape="circle" />}
      {trophy.image && (
        <FooterStatusLineThumb src={trophy.image} size="4" shape="square" fit="contain" />
      )}
      <FooterStatusLineThumb
        src={`/images/trophies/${trophy.type}.png`}
        alt={`${trophy.type} trophy`}
        size="3"
        shape="square"
        fit="contain"
        pixelated
      />
      <FooterStatusLineText>{trophy.name}</FooterStatusLineText>
      <FooterStatusLineSeparator />
      <FooterStatusLineText maxWidth="160px" dim>
        {trophy.game}
      </FooterStatusLineText>
    </FooterStatusLine>
  );
}
