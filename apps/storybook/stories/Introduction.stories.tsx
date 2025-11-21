import { Box, Button, Headline, Paragraph } from "@httpjpg/ui";
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
    <Box css={{ maxW: "4xl", mx: "auto", p: "12", bg: "white" }}>
      <Headline level={1} css={{ mb: "6" }}>
        WELCOME TO HTTPJPG DESIGN SYSTEM
      </Headline>

      <Paragraph size="lg" css={{ mb: "8" }}>
        A brutalist design system built for impact. Strong typography,
        monochromatic foundations, and vibrant accents.
      </Paragraph>

      <Headline level={2} css={{ mb: "4", mt: "8" }}>
        Getting Started
      </Headline>

      <Paragraph css={{ mb: "6" }}>
        This design system provides a comprehensive set of components and tokens
        for building modern web experiences with a brutalist aesthetic.
      </Paragraph>

      <Headline level={3} css={{ mb: "4", mt: "6" }}>
        Core Principles
      </Headline>

      <Box css={{ mb: "6", "& p": { mb: "2" } }}>
        <Paragraph>
          <strong>Strong Typography</strong>: Impact headlines, clean body text
        </Paragraph>
        <Paragraph>
          <strong>Minimal Color Palette</strong>: Monochromatic base with
          vibrant accents
        </Paragraph>
        <Paragraph>
          <strong>Functional Spacing</strong>: Clear hierarchy and breathing
          room
        </Paragraph>
        <Paragraph>
          <strong>Raw Materials</strong>: Honest, unpolished design language
        </Paragraph>
      </Box>

      <Headline level={2} css={{ mb: "4", mt: "8" }}>
        What's Inside
      </Headline>

      <Headline level={3} css={{ mb: "4", mt: "6" }}>
        Components
      </Headline>

      <Paragraph css={{ mb: "4" }}>
        Browse our collection of production-ready React components:
      </Paragraph>

      <Box css={{ mb: "6", "& p": { mb: "2" } }}>
        <Paragraph>
          <strong>Layout</strong>: Grid, Box, Container, Stack, Center
        </Paragraph>
        <Paragraph>
          <strong>Typography</strong>: Headline, Paragraph, Link
        </Paragraph>
        <Paragraph>
          <strong>Media</strong>: Image, AspectRatio
        </Paragraph>
        <Paragraph>
          <strong>Interactive</strong>: Button, NavLink
        </Paragraph>
        <Paragraph>
          <strong>Composition</strong>: Header, Footer, Page, Section
        </Paragraph>
        <Paragraph>
          <strong>Advanced</strong>: WorkList, Slideshow, AnimateInView,
          CustomCursor, MouseTrail, ScrollProgress, NowPlaying
        </Paragraph>
      </Box>

      <Headline level={3} css={{ mb: "4", mt: "6" }}>
        Design Tokens
      </Headline>

      <Paragraph css={{ mb: "4" }}>
        Our design system is built on a foundation of tokens:
      </Paragraph>

      <Box css={{ mb: "6", "& p": { mb: "2" } }}>
        <Paragraph>
          <strong>Colors</strong>: Monochromatic palette with vibrant primary
          and accent colors
        </Paragraph>
        <Paragraph>
          <strong>Typography</strong>: Font families, sizes, weights, and
          spacing
        </Paragraph>
        <Paragraph>
          <strong>Spacing</strong>: Functional scale from 0.25rem to 24rem
        </Paragraph>
        <Paragraph>
          <strong>Shadows</strong>: Minimal shadow values for depth
        </Paragraph>
        <Paragraph>
          <strong>Border Radius</strong>: Subtle rounding options
        </Paragraph>
      </Box>

      <Headline level={2} css={{ mb: "4", mt: "8" }}>
        Installation
      </Headline>

      <Box
        css={{
          bg: "neutral.900",
          color: "white",
          p: "4",
          borderRadius: "md",
          mb: "6",
          fontFamily: "mono",
          fontSize: "sm",
        }}
      >
        <pre>
          {`# Install the UI package
pnpm add @httpjpg/ui

# Install tokens (if needed separately)
pnpm add @httpjpg/tokens`}
        </pre>
      </Box>

      <Headline level={2} css={{ mb: "4", mt: "8" }}>
        Usage
      </Headline>

      <Box
        css={{
          bg: "neutral.900",
          color: "white",
          p: "4",
          borderRadius: "md",
          mb: "6",
          fontFamily: "mono",
          fontSize: "sm",
        }}
      >
        <pre>
          {`import { Box, Headline, Paragraph, Button } from '@httpjpg/ui';

export default function MyComponent() {
  return (
    <Box css={{ p: '32px' }}>
      <Headline level={1}>BRUTALIST DESIGN</Headline>
      <Paragraph>
        Clean, functional, and impactful.
      </Paragraph>
      <Button>Get Started</Button>
    </Box>
  );
}`}
        </pre>
      </Box>

      <Headline level={2} css={{ mb: "4", mt: "8" }}>
        Architecture
      </Headline>

      <Paragraph css={{ mb: "4" }}>
        Built with modern tools for maximum performance:
      </Paragraph>

      <Box css={{ mb: "6", "& p": { mb: "2" } }}>
        <Paragraph>
          <strong>Panda CSS</strong>: Zero-runtime CSS-in-JS
        </Paragraph>
        <Paragraph>
          <strong>TypeScript</strong>: Full type safety
        </Paragraph>
        <Paragraph>
          <strong>Turborepo</strong>: Monorepo build system
        </Paragraph>
        <Paragraph>
          <strong>Storybook</strong>: Component development and documentation
        </Paragraph>
        <Paragraph>
          <strong>Framer Motion</strong>: Smooth animations
        </Paragraph>
      </Box>

      <Headline level={2} css={{ mb: "4", mt: "8" }}>
        Resources
      </Headline>

      <Paragraph css={{ mb: "8" }}>
        Browse all components in the sidebar, check Design Tokens for styling
        primitives, and view live examples in each component story.
      </Paragraph>

      <Button>Explore Components →</Button>
    </Box>
  ),
};
