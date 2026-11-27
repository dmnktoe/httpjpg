"use client";

import { trackOutboundClick } from "@httpjpg/analytics";
import {
  FooterStatusLine,
  FooterStatusLineGlyph,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";

import type { LastfmTrack } from "@/lib/integrations/lastfm";

export interface LastfmStatusProps {
  track: LastfmTrack | null;
  total?: number | null;
  loaded: boolean;
}

function formatScrobbleCount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function LastfmStatus({ track, total = null, loaded }: LastfmStatusProps) {
  if (!track) {
    return loaded ? null : <FooterStatusLine label="last.fm" loading />;
  }

  return (
    <FooterStatusLine
      label="last.fm"
      href={track.url}
      onClick={() =>
        trackOutboundClick({
          destination: "lastfm",
          href: track.url,
          label: `${track.artist} – ${track.title}`,
        })
      }
    >
      {track.image ? (
        <FooterStatusLineThumb src={track.image} />
      ) : (
        <FooterStatusLineGlyph glyph="♪" />
      )}
      <FooterStatusLineText live={track.nowPlaying}>{track.title}</FooterStatusLineText>
      <FooterStatusLineText dim maxWidth="140px">
        {track.artist}
      </FooterStatusLineText>
      {track.nowPlaying && (
        <FooterStatusLineText fixed aria-label="now playing" css={{ color: "accent.500" }}>
          ▶
        </FooterStatusLineText>
      )}
      {track.loved && (
        <FooterStatusLineText fixed aria-label="loved" css={{ color: "accent.500", opacity: 80 }}>
          ♥
        </FooterStatusLineText>
      )}
      {total !== null && (
        <>
          <FooterStatusLineSeparator />
          <FooterStatusLineText fixed dim aria-label={`${total} scrobbles`}>
            {formatScrobbleCount(total)}
          </FooterStatusLineText>
        </>
      )}
    </FooterStatusLine>
  );
}
