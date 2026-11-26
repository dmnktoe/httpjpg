import { Container, Headline, Section } from "@httpjpg/ui";
import type { Metadata } from "next";

import { FeedComposer } from "@/components/feed/feed-composer";
import { ThemeSync } from "@/components/ui/theme-sync";
import { isPostSlug } from "@/lib/feed/publish";

export const instant = false;

export const metadata: Metadata = {
  title: "compose",
  robots: { index: false, follow: false },
};

interface ComposePageProps {
  searchParams: Promise<{ post?: string | string[] }>;
}

export default async function ComposePage({ searchParams }: ComposePageProps) {
  const { post } = await searchParams;
  const slug = typeof post === "string" && isPostSlug(post) ? post : undefined;

  return (
    <>
      <ThemeSync theme="light" />
      <Section pt={{ base: "8", md: "16" }} pb={{ base: "16", md: "24" }}>
        <Container size="lg">
          <Headline level={1} marginBottom="8">
            {slug ? "edit post" : "new post"}
          </Headline>
          <FeedComposer key={slug ?? "new"} slug={slug} />
        </Container>
      </Section>
    </>
  );
}
