import { Box, Container, Headline, Section } from "@httpjpg/ui";
import type { Metadata } from "next";

import { ActivityList } from "@/components/ui/activity-list";
import { ThemeSync } from "@/components/ui/theme-sync";
import { getActivitySources } from "@/lib/queries/activity";

/**
 * `/now` — what is current, in the nownownow.com sense.
 *
 * The footer widgets each show one of these; this page is the same data with
 * room to breathe. It reads `getActivitySources`, so nothing here can drift
 * out of step with `/log`.
 */

const TITLE = "Now";
const DESCRIPTION = "What I am making, watching, listening to and playing at the moment.";

/** Enough to read as "lately" without turning the page into the log. */
const PER_SECTION = 5;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/now" },
};

export default async function NowPage() {
  const sources = await getActivitySources();

  const sections = [
    { key: "making", label: "making", entries: sources.work, empty: "nothing published yet" },
    { key: "watching", label: "watching", entries: sources.films, empty: "no films logged" },
    { key: "collecting", label: "collecting", entries: sources.records, empty: "no records added" },
    { key: "playing", label: "playing", entries: sources.trophies, empty: "no trophies earned" },
  ].filter((section) => section.entries.length > 0);

  return (
    <>
      <ThemeSync theme="light" />
      <Section pt="16" pb="16" useContainer={false}>
        <Container size="lg">
          <Headline level={1}>{TITLE}</Headline>
          <Box css={{ maxW: "65ch", mt: "3", opacity: 0.6, fontFamily: "mono", fontSize: "sm" }}>
            {DESCRIPTION} Pulled live from Storyblok, Letterboxd, Discogs and PlayStation — see{" "}
            <Box as="a" href="/log" css={{ color: "primary.500" }}>
              /log
            </Box>{" "}
            for the full history.
          </Box>

          {sections.length === 0 ? (
            <Box css={{ mt: "12", opacity: 0.4, fontFamily: "mono", fontSize: "sm" }}>
              Nothing to report — every source is either switched off or unreachable right now.
            </Box>
          ) : (
            <Box css={{ display: "flex", flexDirection: "column", gap: "10", mt: "12" }}>
              {sections.map((section) => (
                <Box key={section.key}>
                  <Box
                    as="h2"
                    css={{
                      mb: "3",
                      opacity: 0.5,
                      fontFamily: "mono",
                      fontSize: "xs",
                      fontWeight: "normal",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {section.label}
                  </Box>
                  <ActivityList
                    entries={section.entries.slice(0, PER_SECTION)}
                    emptyLabel={section.empty}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </Section>
    </>
  );
}

/**
 * `getConfig` reads draft mode, so the render is dynamic either way. The
 * expensive part — the third-party calls — is cached inside
 * `getActivitySources` rather than at the route level.
 */
export const dynamic = "force-dynamic";
