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

export interface XStatusProps {
  profile: XProfile | null;
  post: XPost | null;
  /** False while the request is in flight, so the line holds instead of collapsing. */
  loaded: boolean;
}

function formatFollowerCount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function XStatus({ profile, post, loaded }: XStatusProps) {
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
        <Box as="span" aria-label="quote post" css={{ flexShrink: 0, opacity: 40 }}>
          ❝
        </Box>
      )}
      {post.hasMedia && (
        <Box as="span" aria-label="has media" css={{ flexShrink: 0, opacity: 50 }}>
          ▣
        </Box>
      )}
    </FooterStatusLine>
  );
}
