"use client";

import {
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";

import type { DiscogsRelease } from "@/lib/integrations/discogs";
import { useWidgetData } from "@/lib/use-widget-data";

interface DiscogsResponse {
  releases?: DiscogsRelease[];
}

export function DiscogsStatus() {
  const { data, loaded } = useWidgetData<DiscogsResponse>("/api/discogs");
  const release = data?.releases?.[0] ?? null;

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
