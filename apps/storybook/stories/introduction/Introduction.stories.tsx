import {
  ASCII_DIVIDER_STARS,
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

export const Introduction = {
  render: () => (
    <Box css={{ bg: "pageBg", color: "pageFg", minH: "100vh" }}>
      <Container size="lg" py={12}>
        <Stack direction="vertical" gap="10">
          {/* ── Top bar ── */}
          <Box
            css={{
              fontFamily: "mono",
              fontSize: "xs",
              letterSpacing: "wider",
              opacity: 0.4,
            }}
          >
            ⇝ httpjpg / design system &nbsp; · &nbsp; toggle theme in the toolbar ↗
          </Box>

          {/* ── Hero ── */}
          <Box>
            <Headline level={1}>HTTPJPG DESIGN SYSTEM</Headline>

            <Paragraph size="lg" color="muted" css={{ mt: "4", maxW: "65ch" }}>
              A brutalist component library for the httpjpg portfolio. Mono type, hard edges,
              maximalist ASCII accents. Built on Panda CSS (zero-runtime), driven by Storyblok,
              rendered by Next.js. Every component ships with semantic color tokens that flip
              between light and dark — pageBg, pageFg, pageMuted, pageBorder.
            </Paragraph>

            <Paragraph size="sm" color="muted" css={{ mt: "3", maxW: "65ch" }}>
              The design language is deliberately raw: 2px borders instead of box-shadows, monospace
              where others use sans-serif, corner brackets ┌ ┐ └ ┘ as decoration, unicode sparkles ✦
              ◆ ⋆ as visual punctuation. Type hierarchy uses Impact for headlines and a compact 12px
              base size for information density.
            </Paragraph>

            <Stack direction="horizontal" gap="2" css={{ mt: "6", flexWrap: "wrap" }}>
              <Button href="https://github.com/dmnktoe/httpjpg" variant="primary" size="sm">
                ✦ GitHub ↗
              </Button>
              <Button href="https://www.httpjpg.com" variant="secondary" size="sm">
                ◆ Live Site ↗
              </Button>
              <Button href="https://www.npmjs.com/org/httpjpg" variant="accent" size="sm">
                ⋆ npm ↗
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
            <Headline level={2} css={{ mb: "2" }}>
              ◇ THE STACK
            </Headline>
            <Paragraph size="sm" color="muted" css={{ mb: "4", maxW: "55ch" }}>
              Monorepo managed by pnpm workspaces + Turborepo. Every package is ESM-only, TypeScript
              strict, and published via workspace protocol.
            </Paragraph>

            <Stack direction="horizontal" gap="3" css={{ flexWrap: "wrap" }}>
              {[
                "Next.js 16",
                "React 19",
                "Panda CSS",
                "Storyblok",
                "TypeScript",
                "pnpm + Turbo",
                "Vitest",
                "Playwright",
                "Sentry",
                "oxlint",
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
            <Headline level={2} css={{ mb: "2" }}>
              ◇ CORE PRINCIPLES
            </Headline>
            <Paragraph size="sm" color="muted" css={{ mb: "6", maxW: "55ch" }}>
              The system follows four rules. When in doubt, pick the rawer option.
            </Paragraph>

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
                  desc: "Impact for headlines, Arial for body, monospace for data and code. Fluid clamp() sizing across breakpoints. Balanced text-wrap on headings.",
                },
                {
                  icon: "◆",
                  title: "Minimal Palette",
                  desc: "Monochromatic neutral scale 50–950. One electric-blue primary, one lime-green accent, status colors for feedback. Semantic tokens pageBg/pageFg flip with the theme.",
                },
                {
                  icon: "⋆",
                  title: "Raw Materials",
                  desc: "2px solid borders, no gratuitous border-radius, no drop-shadows on containers. Spacing is generous but intentional — content breathes, decoration doesn't.",
                },
                {
                  icon: "┌",
                  title: "ASCII & Kawaii",
                  desc: "Corner brackets ride image masks, sparkle overlays layer on slides, emoji month-symbols in dates, divider patterns from *ੈ✩‧₊˚ to ━━━╳━━━. Decoration is content.",
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
            <Headline level={2} css={{ mb: "2" }}>
              ◇ QUICK START
            </Headline>
            <Paragraph size="sm" color="muted" css={{ mb: "4", maxW: "55ch" }}>
              Import from @httpjpg/ui. All components use the css() prop from Panda's styled-system
              — no className strings, no runtime cost.
            </Paragraph>

            <CodeBlock
              code={`import { Box, Headline, Paragraph, Button, Divider } from "@httpjpg/ui";

export default function MyPage() {
  return (
    <Box css={{ p: "8" }}>
      <Headline level={1}>BRUTALIST DESIGN</Headline>
      <Paragraph>
        Clean, functional, and impactful.
      </Paragraph>
      <Divider variant="ascii" />
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
            <Headline level={2} css={{ mb: "2" }}>
              ◇ WHAT'S INSIDE
            </Headline>
            <Paragraph size="sm" color="muted" css={{ mb: "6", maxW: "55ch" }}>
              Browse all components in the sidebar. Each category groups related primitives — from
              layout foundations to interactive widgets.
            </Paragraph>

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

          {/* ── Architecture ── */}
          <Box>
            <Headline level={2} css={{ mb: "2" }}>
              ◇ ARCHITECTURE
            </Headline>
            <Paragraph size="sm" color="muted" css={{ mb: "4", maxW: "55ch" }}>
              Layered package graph: tokens → utils → api → ui → storyblok-ui → apps. Each layer has
              a single responsibility, no circular deps. The codegen bridges CMS schemas to
              TypeScript interfaces.
            </Paragraph>

            <CodeBlock
              code={`tokens          ← design tokens (colors, spacing, type)
storyblok-utils ← runtime types, image processing
storyblok-api   ← raw CDN client
storyblok-next  ← Next.js cache layer (unstable_cache)
ui              ← component library (Panda CSS)
storyblok-ui    ← Sb* blok wrappers (generated types)
storyblok-sync  ← schema push + codegen CLI
portfolio       ← Next.js 16 App Router`}
              language="text"
              filename="dependency graph"
            />
          </Box>

          <Divider variant="ascii" />

          {/* ── Footer ── */}
          <Box css={{ textAlign: "center", py: "8" }}>
            <Paragraph size="sm" color="muted" css={{ fontFamily: "mono", letterSpacing: "wider" }}>
              *ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚
            </Paragraph>
            <Paragraph size="sm" color="muted" css={{ mt: "2" }}>
              Domenik Töfflinger · @dmnktoe · 2024–2026
            </Paragraph>
          </Box>
        </Stack>
      </Container>
    </Box>
  ),
};
