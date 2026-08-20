"use client";

import {
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";

import type { DiscogsRelease } from "@/lib/integrations/discogs";

export interface DiscogsStatusProps {
  release: DiscogsRelease | null;
  /** False while the request is in flight, so the line holds instead of collapsing. */
  loaded: boolean;
}

export function DiscogsStatus({ release, loaded }: DiscogsStatusProps) {
  if (!release) {
    return loaded ? null : <FooterStatusLine label="discogs" loading />;
  }

  return (
    <FooterStatusLine label="discogs" href={release.url}>
      {release.thumb && <FooterStatusLineThumb src={release.thumb} aspect="auto" />}
      <FooterStatusLineText maxWidth="240px">
        {release.artist} — {release.title}
      </FooterStatusLineText>
      {release.year && (
        <FooterStatusLineText fixed dim>
          {release.year}
        </FooterStatusLineText>
      )}
      {release.format && (
        <>
          <FooterStatusLineSeparator />
          <FooterStatusLineText fixed dim>
            {release.format}
          </FooterStatusLineText>
        </>
      )}
    </FooterStatusLine>
  );
}
