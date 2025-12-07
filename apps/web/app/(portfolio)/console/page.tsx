"use client";

import { Box, Headline, Link, Paragraph } from "@httpjpg/ui";
import { useEffect, useState } from "react";
import { ConsoleFooter } from "./_components";

interface ConsoleCard {
  title: string;
  description: string;
  icon: string;
  href: string;
  stats?: {
    label: string;
    value: string;
  }[];
}

const initialCards: ConsoleCard[] = [
  {
    title: "Package Versions",
    description: "Monorepo packages with versions and changelogs",
    icon: "📦",
    href: "/console/versions",
    stats: [
      { label: "Apps", value: "3" },
      { label: "Packages", value: "13" },
      { label: "Version", value: "v1.0.0" },
    ],
  },
  {
    title: "System Status",
    description: "Real-time health monitoring of httpjpg services",
    icon: "🟢",
    href: "/console/status",
    stats: [
      { label: "Services", value: "Loading..." },
      { label: "Monitoring", value: "Uptime Kuma" },
      { label: "Status", value: "Loading..." },
    ],
  },
  {
    title: "CMS Configuration",
    description: "Storyblok CMS settings and configuration",
    icon: "⚙️",
    href: "/console/config",
    stats: [
      { label: "Stories", value: "Loading..." },
      { label: "Space", value: "Loading..." },
      { label: "API", value: "Loading..." },
    ],
  },
  {
    title: "Documentation",
    description: "Complete documentation for the httpjpg monorepo",
    icon: "📖",
    href: "https://docs.httpjpg.com/docs",
    stats: [
      { label: "Guides", value: "12" },
      { label: "API Refs", value: "8" },
      { label: "Examples", value: "24" },
    ],
  },
  {
    title: "Storybook",
    description: "Component library and design system showcase",
    icon: "🎨",
    href: "https://storybook.httpjpg.com/",
    stats: [
      { label: "Components", value: "32" },
      { label: "Stories", value: "156" },
      { label: "Variants", value: "240" },
    ],
  },
];

export default function ConsolePage() {
  const [consoleCards, setConsoleCards] = useState<ConsoleCard[]>(initialCards);

  useEffect(() => {
    const fetchConfigStats = async () => {
      try {
        const response = await fetch("/api/storyblok/config");
        if (response.ok) {
          const data = await response.json();
          setConsoleCards((cards) =>
            cards.map((card) => {
              if (card.title === "CMS Configuration") {
                return {
                  ...card,
                  stats: [
                    {
                      label: "Stories",
                      value: String(data.stories?.total || 0),
                    },
                    { label: "Space", value: data.space?.name || "httpjpg" },
                    {
                      label: "Components",
                      value: String(data.components?.total || 0),
                    },
                  ],
                };
              }
              return card;
            }),
          );
        }
      } catch (error) {
        console.error("Failed to fetch config stats:", error);
      }
    };

    const fetchStatusStats = async () => {
      try {
        const response = await fetch("/api/status");
        if (response.ok) {
          const data = await response.json();
          const allOperational = data.services.every(
            (s: { status: string }) => s.status === "operational",
          );
          const anyDown = data.services.some(
            (s: { status: string }) => s.status === "down",
          );

          setConsoleCards((cards) =>
            cards.map((card) => {
              if (card.title === "System Status") {
                return {
                  ...card,
                  stats: [
                    { label: "Services", value: String(data.services.length) },
                    { label: "Monitoring", value: "Uptime Kuma" },
                    {
                      label: "Status",
                      value: anyDown
                        ? "Down"
                        : allOperational
                          ? "Operational"
                          : "Degraded",
                    },
                  ],
                };
              }
              return card;
            }),
          );
        }
      } catch (error) {
        console.error("Failed to fetch status stats:", error);
      }
    };

    fetchConfigStats();
    fetchStatusStats();
  }, []);

  return (
    <Box
      css={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        css={{
          maxW: "1536px",
          mx: "auto",
          w: "full",
          px: { base: 4, md: 6, lg: 8 },
          py: 8,
          borderBottom: "1px solid",
          borderColor: "black",
        }}
      >
        <Headline level={1} css={{ mb: 2 }}>
          Developer Console
        </Headline>
        <Paragraph css={{ opacity: 0.6, maxW: "2xl" }}>
          Central hub for monitoring, managing, and exploring the httpjpg
          monorepo. Access package versions, system status, documentation, and
          component library.
        </Paragraph>
      </Box>

      {/* Cards Grid */}
      <Box
        css={{
          maxW: "1536px",
          mx: "auto",
          w: "full",
          px: { base: 4, md: 6, lg: 8 },
          py: 8,
          flex: 1,
        }}
      >
        <Box
          css={{
            display: "grid",
            gridTemplateColumns: {
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 12,
          }}
        >
          {consoleCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              css={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Box
                as="article"
                css={{
                  background: "transparent",
                  position: "relative",
                  _hover: {
                    background: "neutral.50",
                  },
                }}
              >
                <Box
                  css={{
                    p: 1,
                    fontFamily: "sans-serif",
                  }}
                >
                  {/* Header mit Icon und Tag */}
                  <Box
                    css={{
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      opacity: 0.6,
                      mb: 2,
                    }}
                  >
                    ⇝ᵣₑcꫀₙₜ / {card.icon}
                  </Box>

                  {/* Title */}
                  <Headline
                    level={3}
                    css={{
                      mb: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    {card.icon} {card.title} ･ﾟ⋆
                  </Headline>

                  {/* Description */}
                  <Box
                    css={{
                      fontSize: "0.875rem",
                      opacity: 0.8,
                      lineHeight: 1.6,
                      mb: 3,
                      display: "-webkit-box",
                      lineClamp: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    style={
                      {
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      } as React.CSSProperties
                    }
                  >
                    ⋆.˚ ᡣ𐭩 .𖥔˚ {card.description} ⋆.˚✮
                  </Box>

                  {/* Stats */}
                  {card.stats && card.stats.length > 0 && (
                    <Box
                      css={{
                        mt: 3,
                        pt: 3,
                        borderTop: "1px solid",
                        borderColor: "black",
                      }}
                    >
                      <Box
                        css={{
                          fontSize: "0.75rem",
                          opacity: 0.6,
                          mb: 2,
                        }}
                      >
                        ꪻꪖᧁડ:
                      </Box>
                      <Box
                        css={{
                          display: "flex",
                          gap: 2,
                          fontSize: "0.75rem",
                          opacity: 0.7,
                          flexWrap: "wrap",
                        }}
                      >
                        {card.stats.map((stat) => (
                          <Box key={stat.label}>
                            {stat.label} ･ {stat.value}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Link>
          ))}
        </Box>

        {/* Quick Links Section */}
        <Box css={{ mt: 12 }}>
          <Box
            css={{
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              opacity: 0.6,
              mb: 2,
            }}
          >
            ⇝ᵣₑcꫀₙₜ / 🚀
          </Box>
          <Headline level={3} css={{ mb: 4, textTransform: "uppercase" }}>
            🚀 Quick Links ･ﾟ⋆
          </Headline>
          <Box
            css={{
              display: "grid",
              gridTemplateColumns: {
                base: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 6,
            }}
          >
            <Box
              as="a"
              href="https://github.com/dmnktoe/httpjpg"
              target="_blank"
              rel="noopener noreferrer"
              css={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Box
                as="article"
                css={{
                  p: 1,
                  background: "transparent",
                  _hover: { background: "neutral.50" },
                }}
              >
                <Box css={{ fontSize: "0.75rem", opacity: 0.6, mb: 1 }}>
                  🔗 GitHub
                </Box>
                <Paragraph css={{ fontSize: "0.875rem" }}>Repository</Paragraph>
              </Box>
            </Box>

            <Box
              as="a"
              href="https://docs.httpjpg.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              css={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Box
                as="article"
                css={{
                  p: 1,
                  background: "transparent",
                  _hover: { background: "neutral.50" },
                }}
              >
                <Box css={{ fontSize: "0.75rem", opacity: 0.6, mb: 1 }}>
                  📖 Docs
                </Box>
                <Paragraph css={{ fontSize: "0.875rem" }}>
                  Documentation
                </Paragraph>
              </Box>
            </Box>

            <Box
              as="a"
              href="https://storybook.httpjpg.com/"
              target="_blank"
              rel="noopener noreferrer"
              css={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Box
                as="article"
                css={{
                  p: 1,
                  background: "transparent",
                  _hover: { background: "neutral.50" },
                }}
              >
                <Box css={{ fontSize: "0.75rem", opacity: 0.6, mb: 1 }}>
                  🎨 Storybook
                </Box>
                <Paragraph css={{ fontSize: "0.875rem" }}>Components</Paragraph>
              </Box>
            </Box>

            <Box
              as="a"
              href="https://status.dmnktoe.de/status/httpjpg"
              target="_blank"
              rel="noopener noreferrer"
              css={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Box
                as="article"
                css={{
                  p: 1,
                  background: "transparent",
                  _hover: { background: "neutral.50" },
                }}
              >
                <Box css={{ fontSize: "0.75rem", opacity: 0.6, mb: 1 }}>
                  🟢 Uptime Kuma
                </Box>
                <Paragraph css={{ fontSize: "0.875rem" }}>
                  Full Status
                </Paragraph>
              </Box>
            </Box>

            <Box
              as="a"
              href="https://github.com/dmnktoe/httpjpg/tree/main/apps"
              target="_blank"
              rel="noopener noreferrer"
              css={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Box
                as="article"
                css={{
                  p: 1,
                  background: "transparent",
                  _hover: { background: "neutral.50" },
                }}
              >
                <Box css={{ fontSize: "0.75rem", opacity: 0.6, mb: 1 }}>
                  📱 Apps
                </Box>
                <Paragraph css={{ fontSize: "0.875rem" }}>Directory</Paragraph>
              </Box>
            </Box>

            <Box
              as="a"
              href="https://github.com/dmnktoe/httpjpg/tree/main/packages"
              target="_blank"
              rel="noopener noreferrer"
              css={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Box
                as="article"
                css={{
                  p: 1,
                  background: "transparent",
                  _hover: { background: "neutral.50" },
                }}
              >
                <Box css={{ fontSize: "0.75rem", opacity: 0.6, mb: 1 }}>
                  📦 Packages
                </Box>
                <Paragraph css={{ fontSize: "0.875rem" }}>Directory</Paragraph>
              </Box>
            </Box>

            <Box
              as="a"
              href="/api/status"
              target="_blank"
              rel="noopener noreferrer"
              css={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Box
                as="article"
                css={{
                  p: 1,
                  background: "transparent",
                  _hover: { background: "neutral.50" },
                }}
              >
                <Box css={{ fontSize: "0.75rem", opacity: 0.6, mb: 1 }}>
                  🔌 Status API
                </Box>
                <Paragraph css={{ fontSize: "0.875rem" }}>Endpoint</Paragraph>
              </Box>
            </Box>

            <Box
              as="a"
              href="/api/versions"
              target="_blank"
              rel="noopener noreferrer"
              css={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Box
                as="article"
                css={{
                  p: 1,
                  background: "transparent",
                  _hover: { background: "neutral.50" },
                }}
              >
                <Box css={{ fontSize: "0.75rem", opacity: 0.6, mb: 1 }}>
                  🔌 Versions API
                </Box>
                <Paragraph css={{ fontSize: "0.875rem" }}>Endpoint</Paragraph>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <ConsoleFooter message="Developer Console · Built with Next.js" />
    </Box>
  );
}
