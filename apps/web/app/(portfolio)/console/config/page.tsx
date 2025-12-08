"use client";

import { Box, Container } from "@httpjpg/ui";
import { useEffect, useState } from "react";
import { ConsoleHeader, StatCard } from "../_components";

interface StoryblokConfig {
  space?: {
    name: string;
    domain: string;
    id: number;
    plan: string;
  };
  stories?: {
    total: number;
    published: number;
    drafts: number;
  };
  components?: {
    total: number;
  };
  datasources?: {
    total: number;
  };
}

export default function ConfigPage() {
  const [config, setConfig] = useState<StoryblokConfig>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/storyblok/config");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch config");
        }

        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <Box
      css={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ConsoleHeader
        tag="⇝ᵣₑcꫀₙₜ / ⚙️"
        title="⚙️ CMS Configuration ･ﾟ⋆"
        description="Storyblok space settings and content statistics"
      />

      {/* Content */}
      <Container
        size="2xl"
        px={{ base: 4, md: 6, lg: 8 }}
        css={{
          py: 8,
          flex: 1,
        }}
      >
        {!loading && error && (
          <Box
            css={{
              p: 6,
              background: "danger.50",
            }}
          >
            <Box css={{ fontSize: "lg", fontWeight: "bold", mb: 2 }}>
              ⚠️ Error Loading Configuration
            </Box>
            <Box css={{ fontSize: "sm", opacity: 70 }}>{error}</Box>
          </Box>
        )}

        {!loading && !error && (
          <>
            {/* Space Info */}
            {config.space && (
              <Box css={{ mb: 8 }}>
                <Box
                  css={{
                    fontSize: "lg",
                    fontWeight: "bold",
                    mb: 4,
                  }}
                >
                  Space Information
                </Box>
                <Box
                  css={{
                    p: 6,
                    background: "neutral.50",
                  }}
                >
                  <Box
                    css={{
                      display: "grid",
                      gridTemplateColumns: {
                        base: "1fr",
                        md: "repeat(2, 1fr)",
                      },
                      gap: 6,
                    }}
                  >
                    <Box>
                      <Box
                        css={{
                          fontSize: "xs",
                          opacity: 50,
                          mb: 1,
                          textTransform: "uppercase",
                          letterSpacing: "wider",
                        }}
                      >
                        Space Name
                      </Box>
                      <Box
                        css={{
                          fontSize: "lg",
                          fontWeight: "bold",
                          fontFamily: "mono",
                        }}
                      >
                        {config.space.name}
                      </Box>
                    </Box>
                    <Box>
                      <Box
                        css={{
                          fontSize: "xs",
                          opacity: 50,
                          mb: 1,
                          textTransform: "uppercase",
                          letterSpacing: "wider",
                        }}
                      >
                        Domain
                      </Box>
                      <Box
                        css={{
                          fontSize: "lg",
                          fontWeight: "bold",
                          fontFamily: "mono",
                        }}
                      >
                        {config.space.domain}
                      </Box>
                    </Box>
                    <Box>
                      <Box
                        css={{
                          fontSize: "xs",
                          opacity: 50,
                          mb: 1,
                          textTransform: "uppercase",
                          letterSpacing: "wider",
                        }}
                      >
                        Space ID
                      </Box>
                      <Box
                        css={{
                          fontSize: "lg",
                          fontWeight: "bold",
                          fontFamily: "mono",
                        }}
                      >
                        {config.space.id}
                      </Box>
                    </Box>
                    <Box>
                      <Box
                        css={{
                          fontSize: "xs",
                          opacity: 50,
                          mb: 1,
                          textTransform: "uppercase",
                          letterSpacing: "wider",
                        }}
                      >
                        Plan
                      </Box>
                      <Box
                        css={{
                          fontSize: "lg",
                          fontWeight: "bold",
                          fontFamily: "mono",
                          textTransform: "capitalize",
                        }}
                      >
                        {config.space.plan}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Content Statistics */}
            <Box css={{ mb: 8 }}>
              <Box
                css={{
                  fontSize: "lg",
                  fontWeight: "bold",
                  mb: 4,
                }}
              >
                Content Statistics
              </Box>
              <Box
                css={{
                  display: "grid",
                  gridTemplateColumns: {
                    base: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 4,
                }}
              >
                {config.stories && (
                  <>
                    <StatCard
                      label="Total Stories"
                      value={config.stories.total}
                    />
                    <StatCard
                      label="Published"
                      value={config.stories.published}
                    />
                    <StatCard label="Drafts" value={config.stories.drafts} />
                  </>
                )}
                {config.components && (
                  <StatCard
                    label="Components"
                    value={config.components.total}
                  />
                )}
                {config.datasources && (
                  <StatCard
                    label="Datasources"
                    value={config.datasources.total}
                  />
                )}
              </Box>
            </Box>

            {/* API Info */}
            <Box
              css={{
                p: 6,
                background: "neutral.50",
              }}
            >
              <Box
                css={{
                  fontSize: "lg",
                  fontWeight: "bold",
                  mb: 4,
                }}
              >
                🔗 API Endpoints
              </Box>
              <Box css={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box
                  css={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 3,
                    background: "white",
                  }}
                >
                  <Box css={{ fontSize: "sm", fontFamily: "mono" }}>
                    <Box
                      as="a"
                      href="/api/storyblok/config"
                      target="_blank"
                      rel="noopener noreferrer"
                      css={{ _hover: { textDecoration: "underline" } }}
                    >
                      GET /api/storyblok/config
                    </Box>
                  </Box>
                  <Box
                    css={{
                      px: 2,
                      py: 1,
                      background: "success.500",
                      color: "white",
                      fontSize: "xs",
                      fontWeight: "bold",
                    }}
                  >
                    Active
                  </Box>
                </Box>
                <Box
                  css={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 3,
                    background: "white",
                  }}
                >
                  <Box css={{ fontSize: "sm", fontFamily: "mono" }}>
                    Content Delivery API (CDN)
                  </Box>
                  <Box
                    css={{
                      px: 2,
                      py: 1,
                      background: "success.500",
                      color: "white",
                      fontSize: "xs",
                      fontWeight: "bold",
                    }}
                  >
                    Active
                  </Box>
                </Box>
                <Box
                  css={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 3,
                    background: "white",
                  }}
                >
                  <Box css={{ fontSize: "sm", fontFamily: "mono" }}>
                    Visual Editor Integration
                  </Box>
                  <Box
                    css={{
                      px: 2,
                      py: 1,
                      background: "success.500",
                      color: "white",
                      fontSize: "xs",
                      fontWeight: "bold",
                    }}
                  >
                    Enabled
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
