"use client";

import { Box, Tooltip } from "@httpjpg/ui";
import { useEffect, useState } from "react";

import type { XPost, XProfile } from "@/lib/integrations/x-posts";

export function XStatus() {
  const [timeline, setTimeline] = useState<XTimelineState | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTimeline = async () => {
      try {
        const response = await fetch("/api/x", { signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          const post = data.posts?.[0];
          if (data.profile && post) {
            setTimeline({ profile: data.profile, post });
          }
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Failed to fetch X posts:", error);
      } finally {
        if (!controller.signal.aborted) {
          setLoaded(true);
        }
      }
    };

    fetchTimeline();

    return () => controller.abort();
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
        maxWidth: "full",
        minHeight: "5",
        color: "inherit",
        opacity: 80,
        fontFamily: "mono",
        fontSize: "xs",
        textDecoration: "none",
      }}
    >
      <Box as="span" css={{ flexShrink: 0, opacity: 60 }}>
        x:
      </Box>
      {profile.avatar && (
        // Tooltip renders the wrapper that acts as the flex item here, so the
        // pin has to sit on it rather than on the avatar span alone.
        <Tooltip label={`@${profile.username}`} css={{ flexShrink: 0 }}>
          <Box
            as="span"
            css={{
              display: "inline-block",
              flexShrink: 0,
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
        <Box
          as="span"
          aria-label={`${profile.followerCount} followers`}
          css={{ flexShrink: 0, opacity: 50 }}
        >
          ({formatFollowerCount(profile.followerCount)})
        </Box>
      )}
      <Box as="span" css={{ flexShrink: 0, opacity: 40 }}>
        •
      </Box>
      {/* The only span allowed to shrink — minWidth 0 lets the post ellipsize
          instead of squeezing the fixed spans below their content width. */}
      <Box
        as="span"
        css={{
          minWidth: "0",
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
        <Box as="span" aria-label="quote post" css={{ flexShrink: 0, opacity: 40 }}>
          ❝
        </Box>
      )}
      {post.hasMedia && (
        <Box as="span" aria-label="has media" css={{ flexShrink: 0, opacity: 50 }}>
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
