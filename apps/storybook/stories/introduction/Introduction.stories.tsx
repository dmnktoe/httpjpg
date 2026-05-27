import {
  ASCII_DIVIDER_STARS,
  AsciiArt,
  Box,
  Button,
  CodeBlock,
  Container,
  Divider,
  Headline,
  Paragraph,
  Stack,
} from "@httpjpg/ui";
import type { Meta } from "@storybook/react";

const meta = {
  title: "Introduction",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

const HERO_ASCII = `
    ╭──────────────────────────────────╮
    │   ⇝ www.httpjpg.com             │
    │   ✦ brutalist design system ✦   │
    ╰──────────────────────────────────╯
`;

export const Introduction = {
  render: () => (
    <Box css={{ bg: "pageBg", color: "pageFg", minH: "100vh" }}>
      <Container size="lg" py={12}>
        <Stack direction="vertical" gap="10">
          {/* ── Hero ── */}
          <Box>
            <AsciiArt label="httpjpg design system">{HERO_ASCII}</AsciiArt>

            <Headline level={1} css={{ mt: "6" }}>
              HTTPJPG DESIGN SYSTEM
            </Headline>

            <Paragraph size="lg" color="muted" css={{ mt: "4" }}>
              Brutalist component library. Mono type, hard edges, maximalist accents — ASCII and
              kawaii decorations in the rendered UI, not in the margins.
            </Paragraph>

            <Stack direction="horizontal" gap="3" css={{ mt: "6", flexWrap: "wrap" }}>
              <Button href="https://github.com/dmnktoe/httpjpg" variant="primary" size="sm">
                ✦ GitHub ↗
              </Button>
              <Button href="https://www.httpjpg.com" variant="outline" size="sm">
                ◆ Live Site ↗
              </Button>
            </Stack>
          </Box>

          {/* ── Badges ── */}
          <Stack direction="horizontal" gap="2" css={{ flexWrap: "wrap" }}>
            <img
              src="https://img.shields.io/github/actions/workflow/status/dmnktoe/httpjpg/ci.yml?branch=main&logo=github&logoColor=fff&label=CI&labelColor=000"
              alt="CI Status"
            />
            <img
              src="https://img.shields.io/github/v/release/dmnktoe/httpjpg?label=Release&logo=Github&logoColor=fff&style=flat&labelColor=000&color=00b4f0"
              alt="Latest Release"
            />
            <img
              src="https://img.shields.io/codecov/c/github/dmnktoe/httpjpg?logo=codecov&logoColor=fff&label=Coverage&labelColor=000"
              alt="Coverage"
            />
          </Stack>

          <Divider variant="ascii" pattern={ASCII_DIVIDER_STARS} />

          {/* ── Stack ── */}
          <Box>
            <Headline level={2} css={{ mb: "4" }}>
              ◇ THE STACK
            </Headline>

            <Stack direction="horizontal" gap="4" css={{ flexWrap: "wrap" }}>
              {[
                "Next.js 16",
                "React 19",
                "Panda CSS",
                "Storyblok",
                "TypeScript",
                "pnpm + Turbo",
                "Vitest",
                "Playwright",
              ].map((tech) => (
                <Box
                  key={tech}
                  css={{
                    px: "3",
                    py: "1",
                    border: "1px solid",
                    borderColor: "pageBorder",
                    fontFamily: "mono",
                    fontSize: "xs",
                    letterSpacing: "wider",
                    textTransform: "uppercase",
                  }}
                >
                  {tech}
                </Box>
              ))}
            </Stack>
          </Box>

          <Divider variant="ascii" />

          {/* ── Principles ── */}
          <Box>
            <Headline level={2} css={{ mb: "6" }}>
              ◇ CORE PRINCIPLES
            </Headline>

            <Box
              css={{
                display: "grid",
                gridTemplateColumns: { base: "1fr", md: "1fr 1fr" },
                gap: "6",
              }}
            >
              {[
                {
                  icon: "✦",
                  title: "Strong Typography",
                  desc: "Impact headlines, clean body text, monospace for data",
                },
                {
                  icon: "◆",
                  title: "Minimal Palette",
                  desc: "Monochromatic base with vibrant primary + accent",
                },
                {
                  icon: "⋆",
                  title: "Raw Materials",
                  desc: "Honest, unpolished, hard borders, no gratuitous rounding",
                },
                {
                  icon: "┌",
                  title: "ASCII Decoration",
                  desc: "Corner brackets, sparkle overlays, kawaii text art",
                },
              ].map((p) => (
                <Box
                  key={p.title}
                  css={{
                    p: "5",
                    border: "2px solid",
                    borderColor: "pageFg",
                  }}
                >
                  <Box
                    css={{
                      fontFamily: "mono",
                      fontSize: "lg",
                      mb: "2",
                      opacity: 0.5,
                    }}
                  >
                    {p.icon}
                  </Box>
                  <Paragraph weight="semibold" css={{ mb: "1" }}>
                    {p.title}
                  </Paragraph>
                  <Paragraph size="sm" color="muted">
                    {p.desc}
                  </Paragraph>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider variant="ascii" />

          {/* ── Quick Start ── */}
          <Box>
            <Headline level={2} css={{ mb: "4" }}>
              ◇ QUICK START
            </Headline>

            <CodeBlock
              code={`import { Box, Headline, Paragraph, Button } from "@httpjpg/ui";

export default function MyPage() {
  return (
    <Box css={{ p: "8" }}>
      <Headline level={1}>BRUTALIST DESIGN</Headline>
      <Paragraph>Clean, functional, and impactful.</Paragraph>
      <Button>Get Started ✦</Button>
    </Box>
  );
}`}
              language="tsx"
              filename="page.tsx"
              showLineNumbers
            />
          </Box>

          <Divider variant="ascii" />

          {/* ── Components ── */}
          <Box>
            <Headline level={2} css={{ mb: "6" }}>
              ◇ WHAT'S INSIDE
            </Headline>

            <Box
              css={{
                display: "grid",
                gridTemplateColumns: { base: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                gap: "4",
              }}
            >
              {[
                { cat: "Layout", items: "Box · Grid · Container · Stack · Section · Page" },
                { cat: "Typography", items: "Headline · Paragraph · Link · AsciiArt" },
                { cat: "Media", items: "Image · Video · Slideshow · ScrollClipImage" },
                { cat: "Display", items: "Accordion · Callout · CodeBlock · Stats · List" },
                { cat: "Inputs", items: "Button · IconButton · Loading" },
                { cat: "Navigation", items: "Header · Footer · NavLink" },
                { cat: "Motion", items: "CustomCursor · MouseTrail · AnimateInView · Marquee" },
                { cat: "Widgets", items: "MusicPlayer · NowPlaying" },
                { cat: "Decoration", items: "Divider · ImageOverlay · FloatingPreviewBadge" },
              ].map((g) => (
                <Box key={g.cat} css={{ p: "4", borderTop: "2px solid", borderColor: "pageFg" }}>
                  <Box
                    css={{
                      fontFamily: "mono",
                      fontSize: "xs",
                      textTransform: "uppercase",
                      letterSpacing: "wider",
                      mb: "2",
                      opacity: 0.5,
                    }}
                  >
                    ┌ {g.cat}
                  </Box>
                  <Paragraph size="sm" color="muted">
                    {g.items}
                  </Paragraph>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider variant="ascii" />

          {/* ── Footer ── */}
          <Box css={{ textAlign: "center", py: "8" }}>
            <Paragraph size="sm" color="muted" css={{ fontFamily: "mono", letterSpacing: "wider" }}>
              *ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚
            </Paragraph>
            <Paragraph size="sm" color="muted" css={{ mt: "2" }}>
              Domenik Töfflinger · @dmnktoe
            </Paragraph>
          </Box>
        </Stack>
      </Container>
    </Box>
  ),
};
