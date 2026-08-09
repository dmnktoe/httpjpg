"use client";

import { Box, Tooltip } from "@httpjpg/ui";
import { useEffect, useState } from "react";

import type { XPost, XProfile } from "@/lib/integrations/x-posts";

export function XStatus() {
  const [timeline, setTimeline] = useState<XTimelineState | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await fetch("/api/x");
        if (response.ok) {
          const data = await response.json();
          const post = data.posts?.[0];
          if (data.profile && post) {
            setTimeline({ profile: data.profile, post });
          }
        }
      } catch (error) {
        console.error("Failed to fetch X posts:", error);
      } finally {
        setLoaded(true);
      }
    };

    fetchTimeline();
  }, []);

  if (!timeline) {
    if (loaded) {
      return null;
    }
    return (
      <Box
        css={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          minHeight: "5",
          opacity: 80,
          fontFamily: "mono",
          fontSize: "xs",
        }}
      >
        <Box as="span" css={{ opacity: 60 }}>
          x:
        </Box>
        <Box as="span" css={{ opacity: 50 }}>
          loading ...
        </Box>
      </Box>
    );
  }

  const { profile, post } = timeline;

  return (
    <Box
      as="a"
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        minHeight: "5",
        color: "inherit",
        opacity: 80,
        fontFamily: "mono",
        fontSize: "xs",
        textDecoration: "none",
      }}
    >
      <Box as="span" css={{ opacity: 60 }}>
        x:
      </Box>
      {profile.avatar && (
        <Tooltip label={`@${profile.username}`}>
          <Box
            as="span"
            css={{
              display: "inline-block",
              width: "3",
              height: "3",
              verticalAlign: "middle",
              borderRadius: "full",
              overflow: "hidden",
            }}
          >
            <img
              src={profile.avatar}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </Box>
        </Tooltip>
      )}
      {profile.followerCount !== null && (
        <Box as="span" aria-label={`${profile.followerCount} followers`} css={{ opacity: 50 }}>
          ({formatFollowerCount(profile.followerCount)})
        </Box>
      )}
      <Box as="span" css={{ opacity: 40 }}>
        •
      </Box>
      <Box
        as="span"
        css={{
          maxWidth: "260px",
          opacity: 70,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {post.text}
      </Box>
      {post.isQuote && (
        <Box as="span" aria-label="quote post" css={{ opacity: 40 }}>
          ❝
        </Box>
      )}
      {post.hasMedia && (
        <Box as="span" aria-label="has media" css={{ opacity: 50 }}>
          ▣
        </Box>
      )}
    </Box>
  );
}

function formatFollowerCount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

interface XTimelineState {
  profile: XProfile;
  post: XPost;
}
