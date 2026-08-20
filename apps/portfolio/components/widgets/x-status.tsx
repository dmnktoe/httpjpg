"use client";

import {
  Box,
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
  Tooltip,
} from "@httpjpg/ui";

import type { XPost, XProfile } from "@/lib/integrations/x-posts";
import { useWidgetData } from "@/lib/use-widget-data";

interface XResponse {
  profile?: XProfile;
  posts?: XPost[];
}

function formatFollowerCount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function XStatus() {
  const { data, loaded } = useWidgetData<XResponse>("/api/x");
  const profile = data?.profile;
  const post = data?.posts?.[0];

  if (!profile || !post) {
    return loaded ? null : <FooterStatusLine label="x" loading />;
  }

  return (
    <FooterStatusLine label="x" href={post.url}>
      {profile.avatar && (
        <Tooltip label={`@${profile.username}`} css={{ flexShrink: 0 }}>
          <FooterStatusLineThumb src={profile.avatar} shape="circle" />
        </Tooltip>
      )}
      {profile.followerCount !== null && (
        <FooterStatusLineText fixed dim aria-label={`${profile.followerCount} followers`}>
          ({formatFollowerCount(profile.followerCount)})
        </FooterStatusLineText>
      )}
      <FooterStatusLineSeparator />
      <FooterStatusLineText maxWidth="260px">{post.text}</FooterStatusLineText>
      {post.isQuote && (
        <Box as="span" aria-label="quote post" css={{ flexShrink: 0, opacity: 0.4 }}>
          ❝
        </Box>
      )}
      {post.hasMedia && (
        <Box as="span" aria-label="has media" css={{ flexShrink: 0, opacity: 0.5 }}>
          ▣
        </Box>
      )}
    </FooterStatusLine>
  );
}
