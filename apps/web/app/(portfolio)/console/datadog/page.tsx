"use client";

import { Box, Container, Headline, Link, Paragraph } from "@httpjpg/ui";
import { useEffect, useState } from "react";
import { ConsoleHeader } from "../_components";

interface DatadogMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface DatadogStats {
  cpu: number;
  memory: number;
  uptime: string;
  requests: number;
  latency: number;
  errors: number;
  metrics: DatadogMetric[];
}

export default function DatadogPage() {
  const [stats, setStats] = useState<DatadogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatadogStats = async () => {
      try {
        const response = await fetch("/api/datadog");
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

    fetchDatadogStats();
  }, []);

  return (
    <>
      <ConsoleHeader
        tag="📊"
        title="📊 Datadog Infrastructure"
        description="System performance and infrastructure monitoring"
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
            <Paragraph>Loading Datadog metrics...</Paragraph>
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
              Make sure DATADOG_API_KEY and DATADOG_APP_KEY are configured in
              .env
            </Paragraph>
          </Box>
        )}

        {stats && !loading && !error && (
          <>
            {/* System Overview */}
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
                  CPU Usage
                </Box>
                <Headline level={2}>{stats.cpu.toFixed(1)}%</Headline>
                <Box
                  css={{
                    mt: 3,
                    height: 2,
                    bg: "neutral.200",
                    borderRadius: "full",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    css={{
                      height: "full",
                      width: `${stats.cpu}%`,
                      bg:
                        stats.cpu > 80
                          ? "red.500"
                          : stats.cpu > 60
                            ? "yellow.500"
                            : "green.500",
                    }}
                  />
                </Box>
              </Box>

              <Box
                css={{
                  p: 6,
                  bg: "neutral.50",
                  borderRadius: "md",
                }}
              >
                <Box css={{ fontSize: "sm", opacity: 60, mb: 2 }}>
                  Memory Usage
                </Box>
                <Headline level={2}>{stats.memory.toFixed(1)}%</Headline>
                <Box
                  css={{
                    mt: 3,
                    height: 2,
                    bg: "neutral.200",
                    borderRadius: "full",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    css={{
                      height: "full",
                      width: `${stats.memory}%`,
                      bg:
                        stats.memory > 80
                          ? "red.500"
                          : stats.memory > 60
                            ? "yellow.500"
                            : "green.500",
                    }}
                  />
                </Box>
              </Box>

              <Box
                css={{
                  p: 6,
                  bg: "neutral.50",
                  borderRadius: "md",
                }}
              >
                <Box css={{ fontSize: "sm", opacity: 60, mb: 2 }}>Uptime</Box>
                <Headline level={2}>{stats.uptime}</Headline>
              </Box>
            </Box>

            {/* Performance Metrics */}
            <Box css={{ mb: 12 }}>
              <Headline level={2} css={{ mb: 6 }}>
                Performance
              </Headline>

              <Box
                css={{
                  display: "grid",
                  gridTemplateColumns: { base: "1fr", md: "repeat(3, 1fr)" },
                  gap: 6,
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
                    Requests/min
                  </Box>
                  <Headline level={3}>
                    {stats.requests.toLocaleString()}
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
                    Avg Latency
                  </Box>
                  <Headline level={3}>{stats.latency.toFixed(0)}ms</Headline>
                </Box>

                <Box
                  css={{
                    p: 6,
                    bg: "neutral.50",
                    borderRadius: "md",
                  }}
                >
                  <Box css={{ fontSize: "sm", opacity: 60, mb: 2 }}>
                    Error Rate
                  </Box>
                  <Headline level={3}>{stats.errors.toFixed(2)}%</Headline>
                </Box>
              </Box>
            </Box>

            {/* Custom Metrics */}
            <Box>
              <Headline level={2} css={{ mb: 6 }}>
                Custom Metrics
              </Headline>

              <Box css={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {stats.metrics.map((metric, index) => (
                  <Box
                    key={index}
                    css={{
                      p: 6,
                      bg: "neutral.50",
                      borderRadius: "md",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Headline level={3} css={{ mb: 1 }}>
                        {metric.name}
                      </Headline>
                      <Box css={{ fontSize: "xs", opacity: 60 }}>
                        {new Date(metric.timestamp * 1000).toLocaleString()}
                      </Box>
                    </Box>
                    <Box
                      css={{
                        fontSize: "2xl",
                        fontWeight: "bold",
                        fontFamily: "mono",
                      }}
                    >
                      {metric.value.toLocaleString()} {metric.unit}
                    </Box>
                  </Box>
                ))}

                {stats.metrics.length === 0 && (
                  <Box
                    css={{
                      p: 8,
                      textAlign: "center",
                      bg: "neutral.50",
                      borderRadius: "md",
                    }}
                  >
                    <Paragraph css={{ opacity: 60 }}>
                      No custom metrics configured
                    </Paragraph>
                  </Box>
                )}
              </Box>
            </Box>

            {/* External Link */}
            <Box css={{ mt: 12, textAlign: "center" }}>
              <Link
                href="https://app.datadoghq.com"
                target="_blank"
                rel="noopener noreferrer"
                css={{
                  fontSize: "sm",
                  opacity: 60,
                  _hover: { opacity: 100 },
                }}
              >
                View full dashboard on Datadog →
              </Link>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
