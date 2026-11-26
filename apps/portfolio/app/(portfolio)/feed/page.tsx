import { Box, Container, FeedProfile, Headline, Marquee, Section } from "@httpjpg/ui";
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
          <Headline
            level={1}
            aria-label="httpgram, the feed"
            marginBottom="8"
            css={{
              fontSize: { base: "clamp(3rem, 17vw, 5rem)", md: "8rem" },
              lineHeight: 0.85,
              letterSpacing: "-0.06em",
            }}
          >
            <Box as="span" aria-hidden="true">
              httpGR
              <Box as="span" css={{ mx: "-0.06em", color: "primary.500" }}>
                ▲
              </Box>
              M
            </Box>
          </Headline>
          {author && (
            <FeedProfile
              name={author.name}
              avatarSrc={author.avatar}
              stats={[
                { value: String(feed.total), label: "posts" },
                { value: "∞", label: "followers" },
                { value: "0", label: "following" },
              ]}
              css={{ mb: "8" }}
            >
              photo dumps and music, newest first ⋆.˚
            </FeedProfile>
          )}
          {ticker.length > 0 && (
            <Marquee
              speed={40}
              css={{
                py: "2",
                fontFamily: "mono",
                fontSize: "sm",
                borderColor: "pageBorder",
                borderTop: "1px solid",
              }}
            >
              {ticker.map((item) => `⋆ ${item} `).join("")}
            </Marquee>
          )}
          <FeedStream key={feed.posts[0]?.id ?? "empty"} initial={feed} />
        </Container>
      </Section>
    </>
  );
}
