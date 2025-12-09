"use client";

import { Box, Container, Headline, Link, Paragraph } from "@httpjpg/ui";
import { useEffect, useState } from "react";
import { ConsoleHeader } from "../_components";

interface SentryIssue {
  id: string;
  title: string;
  count: number;
  userCount: number;
  level: string;
  lastSeen: string;
}

interface SentryStats {
  errors24h: number;
  totalIssues: number;
  usersAffected: number;
  recentIssues: SentryIssue[];
}

export default function SentryPage() {
  const [stats, setStats] = useState<SentryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSentryStats = async () => {
      try {
        const response = await fetch("/api/sentry");
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchSentryStats();
  }, []);

  return (
    <>
      <ConsoleHeader
        tag="🐛"
        title="🐛 Sentry Error Tracking"
        description="Application error monitoring and performance insights"
      />

      <Container
        size="2xl"
        px={{ base: 4, md: 6, lg: 8 }}
        css={{
          py: 8,
        }}
      >
        {loading && (
          <Box
            css={{
              p: 8,
              textAlign: "center",
              bg: "neutral.50",
              borderRadius: "md",
            }}
          >
            <Paragraph>Loading Sentry data...</Paragraph>
          </Box>
        )}

        {error && (
          <Box
            css={{
              p: 8,
              bg: "red.50",
              borderRadius: "md",
            }}
          >
            <Headline level={3} css={{ mb: 4, color: "red.900" }}>
              Error Loading Data
            </Headline>
            <Paragraph css={{ color: "red.700" }}>{error}</Paragraph>
            <Paragraph size="sm" css={{ mt: 4, opacity: 60 }}>
              Make sure SENTRY_AUTH_TOKEN and SENTRY_ORG are configured in .env
            </Paragraph>
          </Box>
        )}

        {stats && !loading && !error && (
          <>
            {/* Overview Stats */}
            <Box
              css={{
                display: "grid",
                gridTemplateColumns: { base: "1fr", md: "repeat(3, 1fr)" },
                gap: 6,
                mb: 12,
              }}
            >
              <Box
                css={{
                  p: 6,
                  bg: "neutral.50",
                  borderRadius: "md",
                }}
              >
                <Box css={{ fontSize: "sm", opacity: 60, mb: 2 }}>
                  Errors (24h)
                </Box>
                <Headline level={2}>
                  {stats.errors24h.toLocaleString()}
                </Headline>
              </Box>

              <Box
                css={{
                  p: 6,
                  bg: "neutral.50",
                  borderRadius: "md",
                }}
              >
                <Box css={{ fontSize: "sm", opacity: 60, mb: 2 }}>
                  Active Issues
                </Box>
                <Headline level={2}>
                  {stats.totalIssues.toLocaleString()}
                </Headline>
              </Box>

              <Box
                css={{
                  p: 6,
                  bg: "neutral.50",
                  borderRadius: "md",
                }}
              >
                <Box css={{ fontSize: "sm", opacity: 60, mb: 2 }}>
                  Users Affected
                </Box>
                <Headline level={2}>
                  {stats.usersAffected.toLocaleString()}
                </Headline>
              </Box>
            </Box>

            {/* Recent Issues */}
            <Box>
              <Headline level={2} css={{ mb: 6 }}>
                Recent Issues
              </Headline>

              <Box css={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {stats.recentIssues.map((issue) => (
                  <Box
                    key={issue.id}
                    css={{
                      p: 6,
                      bg: "neutral.50",
                      borderRadius: "md",
                      borderLeft: "4px solid",
                      borderLeftColor:
                        issue.level === "error" ? "red.500" : "yellow.500",
                    }}
                  >
                    <Box
                      css={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        mb: 2,
                      }}
                    >
                      <Headline level={3} css={{ flex: 1 }}>
                        {issue.title}
                      </Headline>
                      <Box
                        css={{
                          fontSize: "xs",
                          px: 2,
                          py: 1,
                          bg:
                            issue.level === "error" ? "red.100" : "yellow.100",
                          color:
                            issue.level === "error" ? "red.900" : "yellow.900",
                          borderRadius: "sm",
                          textTransform: "uppercase",
                          fontWeight: "bold",
                        }}
                      >
                        {issue.level}
                      </Box>
                    </Box>

                    <Box
                      css={{
                        display: "flex",
                        gap: 6,
                        fontSize: "sm",
                        opacity: 60,
                      }}
                    >
                      <Box>Events: {issue.count.toLocaleString()}</Box>
                      <Box>Users: {issue.userCount.toLocaleString()}</Box>
                      <Box>
                        Last seen: {new Date(issue.lastSeen).toLocaleString()}
                      </Box>
                    </Box>
                  </Box>
                ))}

                {stats.recentIssues.length === 0 && (
                  <Box
                    css={{
                      p: 8,
                      textAlign: "center",
                      bg: "green.50",
                      borderRadius: "md",
                    }}
                  >
                    <Paragraph css={{ color: "green.900" }}>
                      🎉 No active issues - all systems operational!
                    </Paragraph>
                  </Box>
                )}
              </Box>
            </Box>

            {/* External Link */}
            <Box css={{ mt: 12, textAlign: "center" }}>
              <Link
                href="https://sentry.io"
                target="_blank"
                rel="noopener noreferrer"
                css={{
                  fontSize: "sm",
                  opacity: 60,
                  _hover: { opacity: 100 },
                }}
              >
                View full dashboard on Sentry.io →
              </Link>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
