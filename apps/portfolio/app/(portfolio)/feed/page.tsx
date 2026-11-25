import { Container, Headline, Section } from "@httpjpg/ui";
import type { Metadata } from "next";

import { FeedStream } from "@/components/ui/feed-stream";
import { ThemeSync } from "@/components/ui/theme-sync";
import { getFeedPage } from "@/lib/queries/feed";

export const instant = false;

export const metadata: Metadata = {
  title: "feed",
  description: "Photo dumps and music, newest first.",
  alternates: { canonical: "/feed" },
};

export default async function FeedPage() {
  const feed = await getFeedPage(1);

  return (
    <>
      <ThemeSync theme="light" />
      <Section pt={{ base: "8", md: "16" }} pb={{ base: "16", md: "24" }}>
        <Container size="lg">
          <Headline level={1} marginBottom="8">
            ⋆.˚ feed ˚.⋆
          </Headline>
          <FeedStream key={feed.posts[0]?.id ?? "empty"} initial={feed} />
        </Container>
      </Section>
    </>
  );
}
