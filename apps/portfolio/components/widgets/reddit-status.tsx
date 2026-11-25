"use client";

import { trackOutboundClick } from "@httpjpg/analytics";
import { FooterStatusLine, FooterStatusLineSeparator, FooterStatusLineText } from "@httpjpg/ui";

import type { RedditKarma } from "@/lib/integrations/reddit";

export interface RedditStatusProps {
  reddit: RedditKarma | null;
  loaded: boolean;
}

function formatKarma(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function RedditStatus({ reddit, loaded }: RedditStatusProps) {
  if (!reddit) {
    return loaded ? null : <FooterStatusLine label="reddit" loading />;
  }

  return (
    <FooterStatusLine
      label="reddit"
      href={reddit.url}
      onClick={() =>
        trackOutboundClick({
          destination: "reddit",
          href: reddit.url,
          label: `u/${reddit.username}`,
        })
      }
    >
      <FooterStatusLineText>u/{reddit.username}</FooterStatusLineText>
      <FooterStatusLineSeparator />
      <FooterStatusLineText fixed dim aria-label={`${reddit.karma} karma`}>
        {formatKarma(reddit.karma)} karma
      </FooterStatusLineText>
    </FooterStatusLine>
  );
}
