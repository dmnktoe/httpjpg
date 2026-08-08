"use client";

import { Box } from "@httpjpg/ui";
import { useEffect, useState } from "react";

import type { MastodonPost } from "@/lib/integrations/mastodon";

export function MastodonStatus() {
  const [post, setPost] = useState<MastodonPost | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/mastodon");
        if (response.ok) {
          const data = await response.json();
          setPost(data.posts?.[0] ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch Mastodon posts:", error);
      } finally {
        setLoaded(true);
      }
    };

    fetchPosts();
  }, []);

  if (!post) {
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
          mastodon:
        </Box>
        <Box as="span" css={{ opacity: 50 }}>
          loading ...
        </Box>
      </Box>
    );
  }

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
        mastodon:
      </Box>
      <Box
        as="span"
        css={{
          maxWidth: "280px",
          opacity: 70,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {post.text}
      </Box>
      {post.hasMedia && (
        <Box as="span" aria-label="has media" css={{ opacity: 50 }}>
          ▣
        </Box>
      )}
    </Box>
  );
}
