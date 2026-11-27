"use client";

import { trackOutboundClick } from "@httpjpg/analytics";
import {
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";

import type { SteamStatus as SteamStatusData } from "@/lib/integrations/steam";
import { steamLine } from "@/lib/integrations/steam-game";

export interface SteamStatusProps {
  status: SteamStatusData | null;
  loaded: boolean;
}

export function SteamStatus({ status, loaded }: SteamStatusProps) {
  const line = status ? steamLine(status) : null;
  if (!status || !line) {
    return loaded ? null : <FooterStatusLine label="steam" loading />;
  }

  const href = line.game?.url ?? status.profile.url;
  const title = line.game?.name ?? status.profile.name;
  const thumb = line.game ? line.game.icon : status.profile.avatar;

  return (
    <FooterStatusLine
      label="steam"
      href={href}
      onClick={() => trackOutboundClick({ destination: "steam", href, label: title })}
    >
      {thumb && <FooterStatusLineThumb src={thumb} shape={line.game ? "rounded" : "circle"} />}
      <FooterStatusLineText live={line.kind === "playing"}>{title}</FooterStatusLineText>
      {line.kind === "playing" && (
        <FooterStatusLineText fixed aria-label="playing now" css={{ color: "accent.500" }}>
          ▶
        </FooterStatusLineText>
      )}
      {line.detail && (
        <>
          <FooterStatusLineSeparator />
          <FooterStatusLineText
            fixed
            dim={line.kind !== "profile"}
            css={line.kind === "profile" ? { color: "accent.500" } : undefined}
          >
            {line.detail}
          </FooterStatusLineText>
        </>
      )}
    </FooterStatusLine>
  );
}
