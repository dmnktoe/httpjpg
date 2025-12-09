"use client";

import { Box, Container, Headline, Link, Paragraph } from "@httpjpg/ui";
import { useEffect, useState } from "react";
import { CIStatusBadge, CodecovBadge } from "./_components";

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

interface QuickLink {
  icon: string;
  label: string;
  description: string;
  href: string;
}

const quickLinks: QuickLink[] = [
  {
    icon: "🔗",
    label: "GitHub",
    description: "Repository",
    href: "https://github.com/dmnktoe/httpjpg",
  },
  {
    icon: "📖",
    label: "Docs",
    description: "Documentation",
    href: "https://docs.httpjpg.com/docs",
  },
  {
    icon: "🎨",
    label: "Storybook",
    description: "Components",
    href: "https://storybook.httpjpg.com/",
  },
  {
    icon: "🟢",
    label: "Uptime Kuma",
    description: "Full Status",
    href: "https://status.dmnktoe.de/status/httpjpg",
  },
  {
    icon: "📱",
    label: "Apps",
    description: "Directory",
    href: "https://github.com/dmnktoe/httpjpg/tree/main/apps",
  },
  {
    icon: "📦",
    label: "Packages",
    description: "Directory",
    href: "https://github.com/dmnktoe/httpjpg/tree/main/packages",
  },
  {
    icon: "🔌",
    label: "Status API",
    description: "Endpoint",
    href: "/api/status",
  },
  {
    icon: "🔌",
    label: "Versions API",
    description: "Endpoint",
    href: "/api/versions",
  },
];

const initialCards: ConsoleCard[] = [
  {
    title: "Design Tokens Spec",
    description: "Complete reference of all design tokens and design system",
    icon: "🎯",
    href: "/console/spec",
    stats: [
      { label: "Colors", value: "Loading..." },
      { label: "Typography", value: "Loading..." },
      { label: "Tokens", value: "Loading..." },
    ],
  },
  {
    title: "Package Versions",
    description: "Monorepo packages with versions and changelogs",
    icon: "📦",
    href: "/console/versions",
    stats: [
      { label: "Apps", value: "Loading..." },
      { label: "Packages", value: "Loading..." },
      { label: "Version", value: "Loading..." },
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
    title: "Sentry Errors",
    description: "Application error tracking and performance monitoring",
    icon: "🐛",
    href: "/console/sentry",
    stats: [
      { label: "Errors (24h)", value: "Loading..." },
      { label: "Issues", value: "Loading..." },
      { label: "Users Affected", value: "Loading..." },
    ],
  },
  {
    title: "Datadog RUM",
    description: "Real user monitoring and browser performance",
    icon: "📊",
    href: "/console/datadog",
    stats: [
      { label: "Page Views", value: "Loading..." },
      { label: "Avg Load Time", value: "Loading..." },
      { label: "Error Rate", value: "Loading..." },
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
    title: "Discord Status",
    description: "Real-time Discord presence and activities",
    icon: "💬",
    href: "#discord",
    stats: [
      { label: "Status", value: "Loading..." },
      { label: "Activity", value: "Loading..." },
      { label: "Username", value: "Loading..." },
    ],
  },
  {
    title: "Documentation",
    description: "Complete documentation for the httpjpg monorepo",
    icon: "📖",
    href: "https://docs.httpjpg.com/docs",
    stats: [
      { label: "Guides", value: "Loading..." },
      { label: "API Refs", value: "Loading..." },
      { label: "Examples", value: "Loading..." },
    ],
  },
  {
    title: "Storybook",
    description: "Component library and design system showcase",
    icon: "🎨",
    href: "https://storybook.httpjpg.com/",
    stats: [
      { label: "Components", value: "Loading..." },
      { label: "Stories", value: "Loading..." },
      { label: "Variants", value: "Loading..." },
    ],
  },
];

export default function ConsolePage() {
  const [consoleCards, setConsoleCards] = useState<ConsoleCard[]>(initialCards);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch token stats
        const tokenResponse = await fetch("/api/token-stats");
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          setConsoleCards((prev) =>
            prev.map((card) => {
              if (card.title === "Design Tokens Spec") {
                return {
                  ...card,
                  stats: [
                    { label: "Colors", value: tokenData.colors },
                    { label: "Typography", value: tokenData.typography },
                    { label: "Tokens", value: tokenData.tokens },
                  ],
                };
              }
              return card;
            }),
          );
        }

        // Fetch package stats
        const packageResponse = await fetch("/api/package-stats");
        if (packageResponse.ok) {
          const packageData = await packageResponse.json();
          setConsoleCards((prev) =>
            prev.map((card) => {
              if (card.title === "Package Versions") {
                return {
                  ...card,
                  stats: [
                    { label: "Apps", value: packageData.apps },
                    { label: "Packages", value: packageData.packages },
                    { label: "Version", value: packageData.version },
                  ],
                };
              }
              return card;
            }),
          );
        }

        // Fetch docs stats
        const docsResponse = await fetch("/api/docs-stats");
        if (docsResponse.ok) {
          const docsData = await docsResponse.json();

          setConsoleCards((prev) =>
            prev.map((card) => {
              if (card.title === "Documentation") {
                return {
                  ...card,
                  stats: [
                    {
                      label: "Guides",
                      value: docsData.documentation.guides.toString(),
                    },
                    {
                      label: "API Refs",
                      value: docsData.documentation.apiRefs.toString(),
                    },
                    {
                      label: "Examples",
                      value: docsData.documentation.examples.toString(),
                    },
                  ],
                };
              }
              if (card.title === "Storybook") {
                return {
                  ...card,
                  stats: [
                    {
                      label: "Components",
                      value: docsData.storybook.components.toString(),
                    },
                    {
                      label: "Stories",
                      value: docsData.storybook.stories.toString(),
                    },
                    {
                      label: "Variants",
                      value: docsData.storybook.variants.toString(),
                    },
                  ],
                };
              }
              return card;
            }),
          );
        }

        // Fetch config stats (existing)
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

    const fetchMonitoringStats = async () => {
      try {
        // Fetch Sentry stats
        const sentryResponse = await fetch("/api/sentry");
        if (sentryResponse.ok) {
          const sentryData = await sentryResponse.json();
          setConsoleCards((cards) =>
            cards.map((card) => {
              if (card.title === "Sentry Errors") {
                return {
                  ...card,
                  stats: [
                    {
                      label: "Errors (24h)",
                      value: String(sentryData.errors24h || 0),
                    },
                    {
                      label: "Issues",
                      value: String(sentryData.totalIssues || 0),
                    },
                    {
                      label: "Users Affected",
                      value: String(sentryData.usersAffected || 0),
                    },
                  ],
                };
              }
              return card;
            }),
          );
        } else {
          console.error("Sentry API error:", await sentryResponse.text());
        }

        // Fetch Datadog stats
        const datadogResponse = await fetch("/api/datadog");
        if (datadogResponse.ok) {
          const datadogData = await datadogResponse.json();
          setConsoleCards((cards) =>
            cards.map((card) => {
              if (card.title === "Datadog RUM") {
                return {
                  ...card,
                  stats: [
                    {
                      label: "Page Views",
                      value: String(datadogData.requests || 0),
                    },
                    {
                      label: "Avg Load Time",
                      value: `${datadogData.latency || 0}ms`,
                    },
                    {
                      label: "Error Rate",
                      value: `${datadogData.errors?.toFixed(1) || 0}%`,
                    },
                  ],
                };
              }
              return card;
            }),
          );
        } else {
          console.error("Datadog API error:", await datadogResponse.text());
        }
      } catch (error) {
        console.error("Failed to fetch monitoring stats:", error);
      }
    };

    const fetchDashboardStats = async () => {
      try {
        // Fetch Discord stats
        const discordResponse = await fetch("/api/discord");
        if (discordResponse.ok) {
          const discordData = await discordResponse.json();
          setConsoleCards((cards) =>
            cards.map((card) => {
              if (card.title === "Discord Status") {
                return {
                  ...card,
                  stats: [
                    {
                      label: "Status",
                      value: discordData.status || "offline",
                    },
                    {
                      label: "Activity",
                      value: discordData.activity || "None",
                    },
                    {
                      label: "Username",
                      value: discordData.username || "yl33ly",
                    },
                  ],
                };
              }
              return card;
            }),
          );
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
    fetchStatusStats();
    fetchMonitoringStats();
    fetchDashboardStats();
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
      <Container
        size="2xl"
        px={{ base: 4, md: 6, lg: 8 }}
        css={{
          py: 8,
          borderBottom: "1px solid",
          borderColor: "black",
        }}
      >
        <Headline level={1} css={{ mb: 2 }}>
          Developer Console
        </Headline>
        <Paragraph css={{ opacity: 60, maxW: "2xl" }}>
          Central hub for monitoring, managing, and exploring the httpjpg
          monorepo. Access package versions, system status, documentation, and
          component library.
        </Paragraph>
        <Box
          css={{
            mt: 4,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <CIStatusBadge />
          <CodecovBadge />
        </Box>
      </Container>

      {/* Cards Grid */}
      <Container
        size="2xl"
        px={{ base: 4, md: 6, lg: 8 }}
        css={{
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
                      fontSize: "sm",
                      letterSpacing: "wider",
                      opacity: 60,
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
                      fontSize: "sm",
                      opacity: 80,
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
                    <Box css={{ mt: 3 }}>
                      <Box css={{ fontSize: "sm", opacity: 70, mb: 2 }}>
                        ・゜゜・。。・゜゜・。
                      </Box>
                      <Box
                        css={{
                          fontSize: "sm",
                          opacity: 60,
                          mb: 2,
                        }}
                      >
                        ꪻꪖᧁડ:
                      </Box>
                      <Box
                        css={{
                          display: "flex",
                          gap: 2,
                          fontSize: "sm",
                          opacity: 70,
                          flexWrap: "wrap",
                        }}
                      >
                        {card.stats.map((stat) => {
                          const isDiscordOnline =
                            card.title === "Discord Status" &&
                            stat.label === "Status" &&
                            stat.value === "online";
                          return (
                            <Box
                              key={stat.label}
                              css={{
                                color: isDiscordOnline
                                  ? "success.600"
                                  : "inherit",
                                fontWeight: isDiscordOnline ? 600 : "inherit",
                              }}
                            >
                              {stat.label} ･ {isDiscordOnline && "🟢 "}
                              {stat.value}
                            </Box>
                          );
                        })}
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
              fontSize: "sm",
              letterSpacing: "wider",
              opacity: 60,
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
            {quickLinks.map((link) => (
              <Box
                key={link.href}
                as="a"
                href={link.href}
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
                  <Paragraph size="sm" weight="semibold">
                    {link.icon} {link.label}
                  </Paragraph>
                  <Paragraph size="sm">{link.description}</Paragraph>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
