"use client";

import { SbPost } from "@httpjpg/storyblok-ui";
import {
  Box,
  FeedGrid,
  FeedViewToggle,
  Link,
  Paragraph,
  useFeedEditor,
  useMediaQuery,
} from "@httpjpg/ui";
import { useState } from "react";
import { css } from "styled-system/css";

import type { FeedPage, FeedPostEntry } from "@/lib/queries/feed";

export interface FeedStreamProps {
  initial: FeedPage;
}

type LoadStatus = "idle" | "loading" | "error";

const buttonClass = css({
  px: "3",
  py: "2",
  color: "inherit",
  fontFamily: "mono",
  fontSize: "sm",
  bg: "transparent",
  border: "1px solid",
  borderColor: "pageBorder",
  cursor: "pointer",
  _hover: { textDecoration: "underline" },
  _disabled: { opacity: 0.5, cursor: "progress" },
  _focusVisible: { outline: "2px solid", outlineColor: "primary.500", outlineOffset: "2px" },
});

export function FeedStream({ initial }: FeedStreamProps) {
  const [posts, setPosts] = useState(initial.posts);
  const [page, setPage] = useState(initial.page);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [chosenView, setChosenView] = useState<"grid" | "list" | null>(null);
  const isWide = useMediaQuery(WIDE_QUERY);
  const isEditor = useFeedEditor();
  const view = chosenView ?? (isWide === null ? "auto" : isWide ? "grid" : "list");

  const handleLoadMore = async () => {
    setStatus("loading");
    try {
      const response = await fetch(`/api/feed/posts?page=${page + 1}`);
      if (!response.ok) {
        throw new Error(`Feed page failed: ${response.status}`);
      }
      const next = (await response.json()) as FeedPage;
      if (!next.posts.length) {
        throw new Error("Feed page came back empty");
      }
      setPosts((current) => appendNew(current, next.posts));
      setPage(next.page);
      setHasMore(next.hasMore);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  const composeLink = isEditor ? (
    <Box
      css={{
        display: "flex",
        justifyContent: "center",
        mb: "6",
        fontFamily: "mono",
        fontSize: "sm",
      }}
    >
      <Link href="/feed/upload" css={{ textDecoration: "none" }}>
        [ + new post ]
      </Link>
    </Box>
  ) : null;

  if (!posts.length) {
    return (
      <>
        {composeLink}
        <Paragraph size="sm" color="muted" css={{ fontFamily: "mono" }}>
          nothing here yet ･ﾟ⋆
        </Paragraph>
      </>
    );
  }

  return (
    <>
      <FeedViewToggle
        view={view}
        onViewChange={setChosenView}
        css={{ mx: { base: "-4", md: "0" }, mb: "6" }}
      />
      {composeLink}
      <FeedGrid view={view}>
        {posts.map((post) => (
          <SbPost key={post.id} blok={post.content} href={post.href} />
        ))}
      </FeedGrid>
      {hasMore && (
        <Box
          css={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2",
            mt: "10",
          }}
        >
          <button
            type="button"
            className={buttonClass}
            disabled={status === "loading"}
            onClick={handleLoadMore}
          >
            {status === "loading" ? "[ loading … ]" : "[ load more ]"}
          </button>
          {status === "error" && (
            <Paragraph size="sm" color="muted" role="alert" css={{ fontFamily: "mono" }}>
              could not load more — try again
            </Paragraph>
          )}
        </Box>
      )}
    </>
  );
}

const WIDE_QUERY = "(min-width: 48rem)";

function appendNew(current: FeedPostEntry[], next: FeedPostEntry[]): FeedPostEntry[] {
  const seen = new Set(current.map((post) => post.id));
  return [...current, ...next.filter((post) => !seen.has(post.id))];
}
