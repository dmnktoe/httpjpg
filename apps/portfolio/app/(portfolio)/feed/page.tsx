import { Box, Container, FeedAppBar, FeedProfile, Marquee, Section } from "@httpjpg/ui";
import type { Metadata } from "next";

import { FeedStream } from "@/components/ui/feed-stream";
import { ThemeSync } from "@/components/ui/theme-sync";
import { toTickerItems } from "@/lib/feed/ticker";
import { getAuthor } from "@/lib/queries/config";
import { getFeedPage } from "@/lib/queries/feed";

export const instant = false;

export const metadata: Metadata = {
  title: "feed",
  description: "Photo dumps and music, newest first.",
  alternates: { canonical: "/feed" },
};

export default async function FeedPage() {
  const [feed, author] = await Promise.all([getFeedPage(1), getAuthor()]);
  const ticker = toTickerItems(feed.posts);

  return (
    <>
      <ThemeSync theme="light" />
      <Section pt={{ base: "8", md: "16" }} pb={{ base: "16", md: "24" }}>
        <Container size="md">
          <FeedAppBar back={{ href: "/", label: "home" }} css={{ mx: { base: "-4", md: "0" } }}>
            <Box as="h1" aria-label="httpgram, the feed" css={{ m: 0, font: "inherit" }}>
              <Box as="span" aria-hidden="true">
                httpgr
                <Box
                  as="span"
                  css={{
                    mx: "0.04em",
                    color: "accent.300",
                    fontFamily: "sans",
                    fontSize: "0.5em",
                    verticalAlign: "0.2em",
                    textShadow: "0 -1px 0 rgba(0, 0, 0, 0.5), 0 0 0.5rem {colors.accent.400}",
                  }}
                >
                  ▲
                </Box>
                m
              </Box>
            </Box>
          </FeedAppBar>
          {author && (
            <FeedProfile
              name={author.name}
              avatarSrc={author.avatar}
              stats={[
                { value: String(feed.total), label: "posts" },
                { value: "∞", label: "followers" },
                { value: "0", label: "following" },
              ]}
              css={{ py: "6" }}
            >
              photo dumps and music, newest first ⋆.˚
            </FeedProfile>
          )}
          {ticker.length > 0 && (
            <Box
              aria-hidden="true"
              css={{ mx: { base: "-4", md: "0" }, borderTop: "1px solid {colors.neutral.300}" }}
            >
              <Marquee
                speed={40}
                css={{ px: { base: "4", md: "0" }, py: "2", fontFamily: "mono", fontSize: "sm" }}
              >
                {ticker.map((item) => `⋆ ${item} `).join("")}
              </Marquee>
            </Box>
          )}
          <FeedStream key={feed.posts[0]?.id ?? "empty"} initial={feed} />
        </Container>
      </Section>
    </>
  );
}
