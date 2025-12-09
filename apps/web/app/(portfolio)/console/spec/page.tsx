"use client";

import { Box, Container, Headline } from "@httpjpg/ui";
import { ConsoleHeader } from "../_components";

/**
 * Design Spec Page
 * Showcases all design tokens from the @httpjpg/tokens package
 */
export default function SpecPage() {
  const fontSizes = ["sm", "md", "base", "lg", "xl"];
  const colors = {
    primary: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    accent: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    neutral: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    success: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    warning: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    danger: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    yellow: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  };
  const spacing = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
  const opacity = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const borderRadii = [
    "none",
    "sm",
    "base",
    "md",
    "lg",
    "xl",
    "2xl",
    "3xl",
    "full",
  ];

  return (
    <>
      <ConsoleHeader
        tag="DESIGN SYSTEM"
        title="Design Tokens Specification"
        description="Complete reference of all design tokens used in the httpjpg design system"
      />

      <Container
        size="2xl"
        px={{ base: 4, md: 6, lg: 8 }}
        css={{
          py: 8,
        }}
      >
        {/* Typography */}
        <Box css={{ mb: 12 }}>
          <Headline level={2} css={{ mb: 6 }}>
            Typography
          </Headline>

          <Box css={{ mb: 8 }}>
            <Box
              css={{
                fontSize: "md",
                fontWeight: "bold",
                mb: 4,
                opacity: 70,
              }}
            >
              Font Sizes
            </Box>
            <Box css={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {fontSizes.map((size) => (
                <Box
                  key={size}
                  css={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    p: 3,
                    background: "neutral.50",
                  }}
                >
                  <Box
                    css={{
                      fontSize: "sm",
                      fontFamily: "mono",
                      minW: "20",
                      opacity: 60,
                    }}
                  >
                    {size}
                  </Box>
                  <Box css={{ fontSize: size as any, fontFamily: "sans" }}>
                    The quick brown fox jumps over the lazy dog
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box css={{ mb: 8 }}>
            <Box
              css={{
                fontSize: "md",
                fontWeight: "bold",
                mb: 4,
                opacity: 70,
              }}
            >
              Font Families
            </Box>
            <Box css={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {["sans", "headline", "accent", "mono"].map((family) => (
                <Box
                  key={family}
                  css={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    p: 3,
                    background: "neutral.50",
                  }}
                >
                  <Box
                    css={{
                      fontSize: "sm",
                      fontFamily: "mono",
                      minW: "20",
                      opacity: 60,
                    }}
                  >
                    {family}
                  </Box>
                  <Box css={{ fontFamily: family as any }}>
                    The quick brown fox jumps over the lazy dog
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Colors */}
        <Box css={{ mb: 12 }}>
          <Headline level={2} css={{ mb: 6 }}>
            Colors
          </Headline>

          {Object.entries(colors).map(([colorName, shades]) => (
            <Box key={colorName} css={{ mb: 6 }}>
              <Box
                css={{
                  fontSize: "md",
                  fontWeight: "bold",
                  mb: 4,
                  opacity: 70,
                  textTransform: "capitalize",
                }}
              >
                {colorName}
              </Box>
              <Box
                css={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                  gap: 2,
                }}
              >
                {shades.map((shade) => (
                  <Box
                    key={shade}
                    css={{
                      position: "relative",
                      aspectRatio: "1",
                      background: `${colorName}.${shade}` as any,
                      border: "1px solid",
                      borderColor: "neutral.200",
                    }}
                  >
                    <Box
                      css={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        fontSize: "sm",
                        fontFamily: "mono",
                        color: shade >= 500 ? "white" : "black",
                        background:
                          shade >= 500
                            ? "rgba(0, 0, 0, 0.3)"
                            : "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      {shade}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Spacing */}
        <Box css={{ mb: 12 }}>
          <Headline level={2} css={{ mb: 6 }}>
            Spacing
          </Headline>

          <Box css={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {spacing.map((space) => (
              <Box
                key={space}
                css={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Box
                  css={{
                    fontSize: "sm",
                    fontFamily: "mono",
                    minW: "12",
                    opacity: 60,
                  }}
                >
                  {space}
                </Box>
                <Box
                  css={{
                    height: 8,
                    width: space,
                    background: "primary.500",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Opacity */}
        <Box css={{ mb: 12 }}>
          <Headline level={2} css={{ mb: 6 }}>
            Opacity
          </Headline>

          <Box
            css={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
              gap: 3,
            }}
          >
            {opacity.map((op) => (
              <Box
                key={op}
                css={{
                  p: 4,
                  background: "black",
                  opacity: op,
                  textAlign: "center",
                }}
              >
                <Box
                  css={{ fontSize: "sm", fontFamily: "mono", color: "white" }}
                >
                  {op}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Border Radius */}
        <Box css={{ mb: 12 }}>
          <Headline level={2} css={{ mb: 6 }}>
            Border Radius
          </Headline>

          <Box
            css={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 4,
            }}
          >
            {borderRadii.map((radius) => (
              <Box key={radius} css={{ textAlign: "center" }}>
                <Box
                  css={{
                    width: "full",
                    height: 20,
                    background: "primary.500",
                    borderRadius: radius as any,
                    mb: 2,
                  }}
                />
                <Box css={{ fontSize: "sm", fontFamily: "mono", opacity: 60 }}>
                  {radius}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Shadows */}
        <Box css={{ mb: 12 }}>
          <Headline level={2} css={{ mb: 6 }}>
            Shadows
          </Headline>

          <Box
            css={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 6,
            }}
          >
            {["none", "sm", "base", "md", "lg", "xl", "2xl", "inner"].map(
              (shadow) => (
                <Box key={shadow} css={{ textAlign: "center" }}>
                  <Box
                    css={{
                      width: "full",
                      height: 24,
                      background: "white",
                      boxShadow: shadow as any,
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      css={{
                        width: 16,
                        height: 16,
                        background: "primary.500",
                      }}
                    />
                  </Box>
                  <Box
                    css={{ fontSize: "sm", fontFamily: "mono", opacity: 60 }}
                  >
                    {shadow}
                  </Box>
                </Box>
              ),
            )}
          </Box>
        </Box>

        {/* Sizes */}
        <Box css={{ mb: 12 }}>
          <Headline level={2} css={{ mb: 6 }}>
            Sizes
          </Headline>

          <Box css={{ mb: 8 }}>
            <Box
              css={{
                fontSize: "md",
                fontWeight: "bold",
                mb: 4,
                opacity: 70,
              }}
            >
              Icons
            </Box>
            <Box css={{ display: "flex", alignItems: "end", gap: 4 }}>
              {["xs", "sm", "md", "lg", "xl"].map((size) => (
                <Box key={size} css={{ textAlign: "center" }}>
                  <Box
                    css={{
                      width: `icon.${size}` as any,
                      height: `icon.${size}` as any,
                      background: "primary.500",
                      mb: 2,
                    }}
                  />
                  <Box
                    css={{ fontSize: "sm", fontFamily: "mono", opacity: 60 }}
                  >
                    {size}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box css={{ mb: 8 }}>
            <Box
              css={{
                fontSize: "md",
                fontWeight: "bold",
                mb: 4,
                opacity: 70,
              }}
            >
              Indicators
            </Box>
            <Box css={{ display: "flex", alignItems: "center", gap: 4 }}>
              {["xs", "sm", "md", "lg"].map((size) => (
                <Box key={size} css={{ textAlign: "center" }}>
                  <Box
                    css={{
                      width: `indicator.${size}` as any,
                      height: `indicator.${size}` as any,
                      background: "success.500",
                      borderRadius: "full",
                      mb: 2,
                    }}
                  />
                  <Box
                    css={{ fontSize: "sm", fontFamily: "mono", opacity: 60 }}
                  >
                    {size}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
