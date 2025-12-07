"use client";

import { Box, Container, Headline, Link, Paragraph } from "@httpjpg/ui";
import { useEffect, useState } from "react";

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  changelog: string;
}

// Fallback data (no longer used, loaded from API)
const _PACKAGES_DATA: { apps: PackageInfo[]; packages: PackageInfo[] } = {
  apps: [],
  packages: [],
};

function PackageItem({
  pkg,
  isActive,
  onClick,
}: {
  pkg: PackageInfo;
  isActive: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      css={{
        w: "full",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        p: 3,
        borderRadius: "0.375rem",
        border: "1px solid",
        borderColor: "black",
        background: isActive || isHovered ? "#F5F5F5" : "white",
        transition: "all 0.2s",
        cursor: "pointer",
        textAlign: "left",
        color: "black",
      }}
    >
      <Box css={{ flex: 1, minW: 0 }}>
        <Box
          css={{
            fontFamily: "mono",
            fontSize: "xs",
            fontWeight: "bold",
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {pkg.name}
        </Box>
        {pkg.description && (
          <Box
            css={{
              fontSize: "2xs",
              opacity: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pkg.description}
          </Box>
        )}
      </Box>
      <Box
        css={{
          display: "inline-flex",
          alignItems: "center",
          h: "20px",
          flexShrink: 0,
        }}
      >
        <Box
          css={{
            px: "6px",
            h: "20px",
            display: "flex",
            alignItems: "center",
            background: "#555",
            fontFamily: "mono",
            fontSize: "11px",
            fontWeight: "600",
            color: "white",
            borderTopLeftRadius: "3px",
            borderBottomLeftRadius: "3px",
          }}
        >
          v
        </Box>
        <Box
          css={{
            px: "6px",
            h: "20px",
            display: "flex",
            alignItems: "center",
            background: "#4c1",
            fontFamily: "mono",
            fontSize: "11px",
            fontWeight: "600",
            color: "white",
            borderTopRightRadius: "3px",
            borderBottomRightRadius: "3px",
          }}
        >
          v{pkg.version}
        </Box>
      </Box>
    </Box>
  );
}

function ChangelogViewer({ pkg }: { pkg: PackageInfo | null }) {
  if (!pkg) {
    return (
      <Box
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          opacity: 0.4,
          fontFamily: "mono",
          fontSize: "sm",
        }}
      >
        Select a package to view changelog
      </Box>
    );
  }

  return (
    <Box
      css={{
        fontFamily: "mono",
        fontSize: "sm",
        lineHeight: "relaxed",
        whiteSpace: "pre-wrap",
        opacity: 0.9,
        "& h1": {
          fontSize: "xl",
          fontWeight: "bold",
          mb: 4,
        },
        "& h2": {
          fontSize: "lg",
          fontWeight: "bold",
          mt: 6,
          mb: 3,
          pb: 2,
          borderBottom: "1px solid",
          borderBottomColor: "black",
        },
        "& h3": {
          fontSize: "md",
          fontWeight: "bold",
          mt: 4,
          mb: 2,
        },
        "& ul": {
          listStyle: "disc",
          pl: 6,
          mb: 3,
        },
        "& li": {
          mb: 2,
        },
      }}
    >
      {pkg.changelog}
    </Box>
  );
}

export default function VersionsPage() {
  const [selectedPackage, setSelectedPackage] = useState<PackageInfo | null>(
    null,
  );
  const [packagesData, setPackagesData] = useState<{
    apps: PackageInfo[];
    packages: PackageInfo[];
  }>({ apps: [], packages: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Load package data from API on mount
  useEffect(() => {
    fetch("/api/versions")
      .then((res) => res.json())
      .then((data) => {
        setPackagesData(data);
        setSelectedPackage(data.apps[0]);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading packages:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Box
        css={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "mono",
          fontSize: "sm",
          opacity: 0.6,
        }}
      >
        Loading packages...
      </Box>
    );
  }

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
          py: 6,
          borderBottom: "1px solid",
          borderColor: "black",
        }}
      >
        <Box
          css={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            mb: 2,
          }}
        >
          <Link
            href="/console"
            css={{
              fontSize: "sm",
              opacity: 0.6,
              _hover: { opacity: 1 },
            }}
          >
            ← Console
          </Link>
        </Box>
        <Box
          css={{
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            opacity: 0.6,
            mb: 2,
          }}
        >
          ⇝ᵣₑcꫀₙₜ / 📦
        </Box>
        <Headline level={1} css={{ mb: 2, textTransform: "uppercase" }}>
          📦 Package Versions ･ﾟ⋆
        </Headline>
        <Paragraph css={{ fontSize: "sm", opacity: 0.6 }}>
          ➕.˚ ạ̣ ჩऐჭჩ .ʖ¥ʔ˚ Monorepo packages and changelogs ➕.˚✤
        </Paragraph>
      </Container>

      {/* Content */}
      <Box css={{ flex: 1 }}>
        <Container
          size="2xl"
          px={{ base: 4, md: 6, lg: 8 }}
          css={{
            display: "flex",
            flexDirection: { base: "column", md: "row" },
          }}
        >
          {/* Left Sidebar */}
          <Box
            css={{
              w: { base: "100%", md: "330px" },
              minW: { md: "330px" },
              maxW: { md: "330px" },
              flexShrink: 0,
              borderRight: { md: "1px solid" },
              borderColor: { md: "black" },
              py: 4,
              pr: { md: 6 },
            }}
          >
            <Box css={{ mb: 6 }}>
              <Box
                css={{
                  fontSize: "xs",
                  fontWeight: "bold",
                  mb: 2,
                  opacity: 0.5,
                  textTransform: "uppercase",
                  letterSpacing: "wider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>📦 Applications</span>
                <Link
                  href="https://github.com/dmnktoe/httpjpg/tree/main/apps"
                  isExternal
                  css={{
                    fontSize: "xs",
                    opacity: 0.5,
                    _hover: { opacity: 1 },
                  }}
                >
                  GitHub
                </Link>
              </Box>
              <Box css={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {packagesData.apps.map((pkg) => (
                  <PackageItem
                    key={pkg.name}
                    pkg={pkg}
                    isActive={selectedPackage?.name === pkg.name}
                    onClick={() => setSelectedPackage(pkg)}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Box
                css={{
                  fontSize: "xs",
                  fontWeight: "bold",
                  mb: 2,
                  opacity: 0.5,
                  textTransform: "uppercase",
                  letterSpacing: "wider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>🐝 Packages</span>
                <Link
                  href="https://github.com/dmnktoe/httpjpg/tree/main/packages"
                  isExternal
                  css={{
                    fontSize: "xs",
                    opacity: 0.5,
                    _hover: { opacity: 1 },
                  }}
                >
                  GitHub
                </Link>
              </Box>
              <Box css={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {packagesData.packages.map((pkg) => (
                  <PackageItem
                    key={pkg.name}
                    pkg={pkg}
                    isActive={selectedPackage?.name === pkg.name}
                    onClick={() => setSelectedPackage(pkg)}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Right Content */}
          <Box
            css={{
              flex: 1,
              minW: 0,
              py: 4,
              pl: { md: 6 },
              position: { md: "sticky" },
              top: { md: 0 },
              alignSelf: { md: "flex-start" },
              maxH: { md: "100vh" },
              overflowY: { md: "auto" },
            }}
          >
            {selectedPackage && (
              <Box css={{ mb: 6 }}>
                <Box
                  css={{
                    fontFamily: "mono",
                    fontSize: "xl",
                    fontWeight: "bold",
                    mb: 1,
                  }}
                >
                  {selectedPackage.name}
                </Box>
                <Box
                  css={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    mb: 4,
                  }}
                >
                  <Box
                    css={{
                      display: "inline-flex",
                      alignItems: "center",
                      height: "20px",
                    }}
                  >
                    <Box
                      css={{
                        px: "1.5",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        bg: "#555",
                        fontFamily: "mono",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "white",
                        borderTopLeftRadius: "3px",
                        borderBottomLeftRadius: "3px",
                      }}
                    >
                      v
                    </Box>
                    <Box
                      css={{
                        px: "1.5",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        bg: "#4c1",
                        fontFamily: "mono",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "white",
                        borderTopRightRadius: "3px",
                        borderBottomRightRadius: "3px",
                      }}
                    >
                      v{selectedPackage.version}
                    </Box>
                  </Box>
                  {selectedPackage.description && (
                    <Box css={{ fontSize: "sm", opacity: 0.6 }}>
                      {selectedPackage.description}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
            <ChangelogViewer pkg={selectedPackage} />
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Container
        size="2xl"
        px={{ base: 4, md: 6, lg: 8 }}
        css={{
          py: 6,
          borderTop: "1px solid",
          borderColor: "black",
          mt: 8,
        }}
      >
        <Paragraph css={{ fontSize: "xs", opacity: 0.4, textAlign: "center" }}>
          Last updated: {new Date().toLocaleDateString()}
        </Paragraph>
      </Container>
    </Box>
  );
}
