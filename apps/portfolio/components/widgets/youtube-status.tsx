"use client";

import { trackOutboundClick } from "@httpjpg/analytics";
import {
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
  Tooltip,
} from "@httpjpg/ui";

import type { YoutubeChannel, YoutubeVideo } from "@/lib/integrations/youtube";

export interface YoutubeStatusProps {
  channel: YoutubeChannel | null;
  video: YoutubeVideo | null;
  /** False while the request is in flight, so the line holds instead of collapsing. */
  loaded: boolean;
}

function formatSubscriberCount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function YoutubeStatus({ channel, video, loaded }: YoutubeStatusProps) {
  if (!channel || !video) {
    return loaded ? null : <FooterStatusLine label="youtube" loading />;
  }

  return (
    <FooterStatusLine
      label="youtube"
      href={video.url}
      onClick={() =>
        trackOutboundClick({ destination: "youtube", href: video.url, label: video.title })
      }
    >
      {channel.avatar && (
        <Tooltip label={channel.title} css={{ flexShrink: 0 }}>
          <FooterStatusLineThumb src={channel.avatar} shape="circle" />
        </Tooltip>
      )}
      {channel.subscriberCount !== null && (
        <FooterStatusLineText fixed dim aria-label={`${channel.subscriberCount} subscribers`}>
          ({formatSubscriberCount(channel.subscriberCount)})
        </FooterStatusLineText>
      )}
      <FooterStatusLineSeparator />
      <FooterStatusLineText maxWidth="260px">{video.title}</FooterStatusLineText>
    </FooterStatusLine>
  );
}
