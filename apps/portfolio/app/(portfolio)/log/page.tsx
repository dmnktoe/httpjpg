import { Box, Container, Headline, Section } from "@httpjpg/ui";
import type { Metadata } from "next";

import { ActivityList } from "@/components/ui/activity-list";
import { ThemeSync } from "@/components/ui/theme-sync";
import { type ActivityEntry, getActivitySources, mergeActivity } from "@/lib/queries/activity";

const TITLE = "Log";
const DESCRIPTION = "Published work, films watched, records bought, trophies earned.";

const LIMIT = 60;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/log",
    types: { "application/rss+xml": "/log/feed.xml" },
  },
};

export default async function LogPage() {
  const entries = mergeActivity(await getActivitySources(), LIMIT);
  const months = groupByMonth(entries);

  return (
    <>
      <ThemeSync theme="light" />
      <Section pt="16" pb="16" useContainer={false}>
        <Container size="lg">
          <Headline level={1}>{TITLE}</Headline>
          <Box css={{ maxW: "65ch", mt: "3", opacity: 0.6, fontFamily: "mono", fontSize: "sm" }}>
            {DESCRIPTION} Also available as{" "}
            <Box as="a" href="/log/feed.xml" css={{ color: "primary.500" }}>
              RSS
            </Box>
            .
          </Box>

          {months.length === 0 ? (
            <Box css={{ mt: "12", opacity: 0.4, fontFamily: "mono", fontSize: "sm" }}>
              Nothing logged yet.
            </Box>
          ) : (
            <Box css={{ display: "flex", flexDirection: "column", gap: "10", mt: "12" }}>
              {months.map(([month, monthEntries]) => (
                <Box key={month}>
                  <Box
                    as="h2"
                    css={{
                      mb: "3",
                      opacity: 0.5,
                      fontFamily: "mono",
                      fontSize: "xs",
                      fontWeight: "normal",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {month}
                  </Box>
                  <ActivityList entries={monthEntries} showKind />
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </Section>
    </>
  );
}

function groupByMonth(entries: ActivityEntry[]): Array<[string, ActivityEntry[]]> {
  const months = new Map<string, ActivityEntry[]>();
  for (const entry of entries) {
    const month = entry.date.slice(0, 7);
    const bucket = months.get(month);
    if (bucket) {
      bucket.push(entry);
    } else {
      months.set(month, [entry]);
    }
  }
  return [...months.entries()];
}

export const dynamic = "force-dynamic";
