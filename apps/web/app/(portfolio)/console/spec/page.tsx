"use client";

import {
  borderRadius,
  colors,
  opacity,
  shadows,
  sizes,
  spacing,
  typography,
} from "@httpjpg/tokens";
import { Box, Container, Headline } from "@httpjpg/ui";
import { ConsoleHeader } from "../_components";

/**
 * Design Spec Page
 * Showcases all design tokens from the @httpjpg/tokens package
 */
export default function SpecPage() {
  // Extract font sizes from typography tokens
  const fontSizes = Object.keys(typography.fontSize);

  // Extract color palettes with their shades
  const colorPalettes = Object.entries(colors).reduce(
    (acc, [key, value]) => {
      if (typeof value === "object" && !Array.isArray(value)) {
        acc[key] = Object.keys(value).map((shade) => Number(shade));
      }
      return acc;
    },
    {} as Record<string, number[]>,
  );

  // Extract spacing values
  const spacingValues = Object.keys(spacing).map(Number);

  // Extract opacity values
  const opacityValues = Object.keys(opacity).map(Number);

  // Extract border radius values
  const borderRadii = Object.keys(borderRadius);

  // Extract shadow values
  const shadowValues = Object.keys(shadows);

  return (
    <>
      <ConsoleHeader
        tag="🎯"
        title="🎯 Design Tokens Specification"
        description="Complete reference of all design tokens and design system"
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

          {Object.entries(colorPalettes).map(([colorName, shades]) => (
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
                  gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
                  gap: 3,
                }}
              >
                {shades.map((shade: number) => {
                  const colorValue = (colors as any)[colorName]?.[shade];
                  const isLight = shade < 500;

                  return (
                    <Box
                      key={shade}
                      css={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box
                        css={{
                          position: "relative",
                          height: 16,
                          overflow: "hidden",
                          fontFamily: "mono",
                          fontSize: "2xs",
                          lineHeight: "1",
                          letterSpacing: "-0.05em",
                        }}
                        style={{ background: colorValue || "#000" }}
                      >
                        <Box
                          css={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isLight ? "black" : "white",
                            opacity: 30,
                          }}
                        >
                          {isLight ? "░░░░░░░░░░" : "▓▓▓▓▓▓▓▓▓▓"}
                        </Box>
                      </Box>
                      <Box
                        css={{
                          fontSize: "xs",
                          fontFamily: "mono",
                          textAlign: "center",
                          opacity: 70,
                        }}
                      >
                        [{shade}]
                      </Box>
                      <Box
                        css={{
                          fontSize: "2xs",
                          fontFamily: "mono",
                          textAlign: "center",
                          opacity: 50,
                          wordBreak: "break-all",
                        }}
                      >
                        {colorValue}
                      </Box>
                    </Box>
                  );
                })}
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
            {spacingValues.map((space) => (
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
                    background: "primary.500",
                  }}
                  style={{
                    width: spacing[space as keyof typeof spacing],
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
            {opacityValues.map((op) => (
              <Box
                key={op}
                css={{
                  p: 4,
                  background: "black",
                  textAlign: "center",
                }}
                style={{
                  opacity: opacity[op as keyof typeof opacity],
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
            {shadowValues.map((shadow) => (
              <Box key={shadow} css={{ textAlign: "center" }}>
                <Box
                  css={{
                    width: "full",
                    height: 24,
                    background: "white",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  style={{
                    boxShadow: shadows[shadow as keyof typeof shadows],
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
                <Box css={{ fontSize: "sm", fontFamily: "mono", opacity: 60 }}>
                  {shadow}
                </Box>
              </Box>
            ))}
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
                      background: "primary.500",
                      mb: 2,
                    }}
                    style={{
                      width: sizes.icon[size as keyof typeof sizes.icon],
                      height: sizes.icon[size as keyof typeof sizes.icon],
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
                      background: "success.500",
                      borderRadius: "full",
                      mb: 2,
                    }}
                    style={{
                      width:
                        sizes.indicator[size as keyof typeof sizes.indicator],
                      height:
                        sizes.indicator[size as keyof typeof sizes.indicator],
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
