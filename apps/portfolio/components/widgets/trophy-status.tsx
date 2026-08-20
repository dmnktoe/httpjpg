"use client";

import {
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";

import type { PsnTrophy } from "@/lib/integrations/psn-trophies";
import { useWidgetData } from "@/lib/use-widget-data";

interface TrophyResponse {
  trophies?: PsnTrophy[];
  avatar?: string | null;
}

export function TrophyStatus() {
  const { data, loaded } = useWidgetData<TrophyResponse>("/api/psn-trophies");
  const trophy = data?.trophies?.[0] ?? null;

  if (!trophy) {
    return loaded ? null : <FooterStatusLine loading />;
  }

  return (
    <FooterStatusLine href={trophy.url}>
      {data?.avatar && <FooterStatusLineThumb src={data.avatar} size="4" shape="circle" />}
      {trophy.image && (
        <FooterStatusLineThumb src={trophy.image} size="4" shape="square" fit="contain" />
      )}
      <FooterStatusLineThumb
        src={`/images/trophies/${trophy.type}.png`}
        alt={`${trophy.type} trophy`}
        size="3.5"
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
