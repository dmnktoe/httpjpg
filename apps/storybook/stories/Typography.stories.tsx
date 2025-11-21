import { Box, Headline, Paragraph } from "@httpjpg/ui";
import type { Meta } from "@storybook/react";

const meta = {
  title: "Typography",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

export const TypographyGuide = {
  render: () => (
    <Box css={{ maxW: "6xl", mx: "auto", p: "12", bg: "white" }}>
      <Headline level={1} css={{ mb: "6" }}>
        TYPOGRAPHY
      </Headline>

      <Paragraph size="lg" css={{ mb: "12" }}>
        Strong typography hierarchy following brutalistic design principles.
      </Paragraph>

      {/* Font Families */}
      <Headline level={2} css={{ mb: "6", mt: "12" }}>
        FONT FAMILIES
      </Headline>

      <Box css={{ mb: "8" }}>
        <Headline level={3} css={{ mb: "4" }}>
          Sans Serif (Body Text)
        </Headline>
        <Paragraph css={{ mb: "2" }}>
          Default font family for body text and UI elements.
        </Paragraph>
        <Paragraph css={{ mb: "4", fontFamily: "mono", fontSize: "sm" }}>
          Stack: Arial, Helvetica, sans-serif
        </Paragraph>
        <Box
          css={{
            fontFamily: "sans",
            fontSize: "lg",
            p: "4",
            bg: "neutral.50",
            borderRadius: "md",
          }}
        >
          The quick brown fox jumps over the lazy dog. 0123456789
        </Box>
      </Box>

      <Box css={{ mb: "8" }}>
        <Headline level={3} css={{ mb: "4" }}>
          Headline (Impact)
        </Headline>
        <Paragraph css={{ mb: "2" }}>
          Bold, impactful font for headlines and large text.
        </Paragraph>
        <Paragraph css={{ mb: "4", fontFamily: "mono", fontSize: "sm" }}>
          Stack: Impact, Haettenschweiler, Arial Narrow Bold, sans-serif
        </Paragraph>
        <Box
          css={{
            fontFamily: "headline",
            fontSize: "4xl",
            textTransform: "uppercase",
            p: "4",
            bg: "neutral.50",
            borderRadius: "md",
          }}
        >
          THE QUICK BROWN FOX
        </Box>
      </Box>

      <Box css={{ mb: "8" }}>
        <Headline level={3} css={{ mb: "4" }}>
          Accent (Decorative)
        </Headline>
        <Paragraph css={{ mb: "2" }}>
          Elegant handwritten/script font for special moments and decorative
          text.
        </Paragraph>
        <Paragraph css={{ mb: "4", fontFamily: "mono", fontSize: "sm" }}>
          Stack: Trattatello, Snell Roundhand, Bradley Hand, Brush Script MT,
          cursive
        </Paragraph>
        <Box
          css={{
            fontFamily: "accent",
            fontSize: "2xl",
            p: "4",
            bg: "neutral.50",
            borderRadius: "md",
          }}
        >
          The quick brown fox jumps over the lazy dog
        </Box>
      </Box>

      <Box css={{ mb: "12" }}>
        <Headline level={3} css={{ mb: "4" }}>
          Monospace (Technical)
        </Headline>
        <Paragraph css={{ mb: "2" }}>
          Fixed-width font for code, technical details, and data.
        </Paragraph>
        <Paragraph css={{ mb: "4", fontFamily: "mono", fontSize: "sm" }}>
          Stack: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          monospace
        </Paragraph>
        <Box
          css={{
            fontFamily: "mono",
            fontSize: "sm",
            p: "4",
            bg: "neutral.900",
            color: "white",
            borderRadius: "md",
          }}
        >
          The quick brown fox jumps over the lazy dog. 0123456789
        </Box>
      </Box>

      {/* Font Sizes */}
      <Headline level={2} css={{ mb: "6", mt: "12" }}>
        FONT SIZES
      </Headline>

      <Box
        css={{ mb: "8", display: "flex", flexDirection: "column", gap: "4" }}
      >
        {[
          {
            size: "xs",
            rem: "0.75rem",
            px: "12px",
            desc: "Small text, captions",
          },
          { size: "sm", rem: "0.875rem", px: "14px", desc: "Secondary text" },
          {
            size: "base",
            rem: "1rem",
            px: "16px",
            desc: "Body text (default)",
          },
          {
            size: "lg",
            rem: "1.125rem",
            px: "18px",
            desc: "Emphasized body text",
          },
          { size: "xl", rem: "1.25rem", px: "20px", desc: "Small headings" },
          { size: "2xl", rem: "1.5rem", px: "24px", desc: "Section headings" },
          { size: "3xl", rem: "1.875rem", px: "30px", desc: "Page headings" },
          { size: "4xl", rem: "2.25rem", px: "36px", desc: "Large headings" },
          { size: "5xl", rem: "3rem", px: "48px", desc: "Hero headings" },
          { size: "6xl", rem: "3.75rem", px: "60px", desc: "Display text" },
        ].map(({ size, rem, px, desc }) => (
          <Box
            key={size}
            css={{ p: "4", bg: "neutral.50", borderRadius: "md" }}
          >
            <Box
              css={{
                display: "flex",
                alignItems: "baseline",
                gap: "4",
                mb: "2",
              }}
            >
              <Paragraph
                css={{ fontFamily: "mono", fontSize: "sm", fontWeight: "bold" }}
              >
                {size}
              </Paragraph>
              <Paragraph
                css={{ fontFamily: "mono", fontSize: "xs", opacity: 0.6 }}
              >
                {rem} ({px})
              </Paragraph>
              <Paragraph css={{ fontSize: "xs", opacity: 0.6 }}>
                - {desc}
              </Paragraph>
            </Box>
            <Box css={{ fontSize: size }}>The quick brown fox</Box>
          </Box>
        ))}
      </Box>

      {/* Font Weights */}
      <Headline level={2} css={{ mb: "6", mt: "12" }}>
        FONT WEIGHTS
      </Headline>

      <Box
        css={{ mb: "12", display: "flex", flexDirection: "column", gap: "3" }}
      >
        {[
          { weight: 100, name: "Thin" },
          { weight: 200, name: "Extralight" },
          { weight: 300, name: "Light" },
          { weight: 400, name: "Normal" },
          { weight: 500, name: "Medium" },
          { weight: 600, name: "Semibold" },
          { weight: 700, name: "Bold" },
          { weight: 800, name: "Extrabold" },
          { weight: 900, name: "Black" },
        ].map(({ weight, name }) => (
          <Box key={weight} css={{ fontWeight: weight, fontSize: "lg" }}>
            {name} ({weight}) - The quick brown fox
          </Box>
        ))}
      </Box>

      {/* Letter Spacing */}
      <Headline level={2} css={{ mb: "6", mt: "12" }}>
        LETTER SPACING
      </Headline>

      <Box
        css={{ mb: "12", display: "flex", flexDirection: "column", gap: "3" }}
      >
        {[
          { spacing: "-0.05em", name: "Tighter" },
          { spacing: "-0.025em", name: "Tight" },
          { spacing: "0em", name: "Normal" },
          { spacing: "0.025em", name: "Wide" },
          { spacing: "0.05em", name: "Wider" },
          { spacing: "0.1em", name: "Widest" },
        ].map(({ spacing, name }) => (
          <Box key={spacing} css={{ letterSpacing: spacing, fontSize: "lg" }}>
            {name} ({spacing}) - The quick brown fox
          </Box>
        ))}
      </Box>

      {/* Line Heights */}
      <Headline level={2} css={{ mb: "6", mt: "12" }}>
        LINE HEIGHTS
      </Headline>

      <Box
        css={{ mb: "12", display: "flex", flexDirection: "column", gap: "6" }}
      >
        {[
          { height: 1, name: "None" },
          { height: 1.25, name: "Tight" },
          { height: 1.375, name: "Snug" },
          { height: 1.5, name: "Normal" },
          { height: 1.625, name: "Relaxed" },
          { height: 2, name: "Loose" },
        ].map(({ height, name }) => (
          <Box key={height}>
            <Paragraph css={{ fontWeight: "bold", mb: "2" }}>
              {name} ({height})
            </Paragraph>
            <Box
              css={{
                lineHeight: height,
                p: "4",
                bg: "neutral.50",
                borderRadius: "md",
              }}
            >
              The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit
              amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt.
            </Box>
          </Box>
        ))}
      </Box>

      {/* Usage Examples */}
      <Headline level={2} css={{ mb: "6", mt: "12" }}>
        USAGE EXAMPLES
      </Headline>

      <Box css={{ mb: "8" }}>
        <Headline level={3} css={{ mb: "4" }}>
          Headlines
        </Headline>
        <Box
          css={{
            bg: "neutral.900",
            color: "white",
            p: "4",
            borderRadius: "md",
            fontFamily: "mono",
            fontSize: "sm",
            mb: "4",
          }}
        >
          <pre>
            {`import { Headline } from '@httpjpg/ui';

<Headline level={1}>BRUTALIST DESIGN</Headline>
<Headline level={2}>Section Title</Headline>
<Headline level={3}>Subsection</Headline>`}
          </pre>
        </Box>
        <Box css={{ p: "4", bg: "neutral.50", borderRadius: "md" }}>
          <Headline level={1} css={{ mb: "4" }}>
            BRUTALIST DESIGN
          </Headline>
          <Headline level={2} css={{ mb: "4" }}>
            Section Title
          </Headline>
          <Headline level={3}>Subsection</Headline>
        </Box>
      </Box>

      <Box css={{ mb: "8" }}>
        <Headline level={3} css={{ mb: "4" }}>
          Body Text
        </Headline>
        <Box
          css={{
            bg: "neutral.900",
            color: "white",
            p: "4",
            borderRadius: "md",
            fontFamily: "mono",
            fontSize: "sm",
            mb: "4",
          }}
        >
          <pre>
            {`import { Paragraph } from '@httpjpg/ui';

// Small (default)
<Paragraph>
  Body text with optimal readability
</Paragraph>

// Medium
<Paragraph size="md">
  Emphasized body text
</Paragraph>

// Large
<Paragraph size="lg">
  Lead paragraph or important text
</Paragraph>`}
          </pre>
        </Box>
        <Box
          css={{
            p: "4",
            bg: "neutral.50",
            borderRadius: "md",
            display: "flex",
            flexDirection: "column",
            gap: "3",
          }}
        >
          <Paragraph>
            Small (default): Body text with optimal readability
          </Paragraph>
          <Paragraph size="md">Medium: Emphasized body text</Paragraph>
          <Paragraph size="lg">
            Large: Lead paragraph or important text
          </Paragraph>
        </Box>
      </Box>

      <Box>
        <Headline level={3} css={{ mb: "4" }}>
          Technical Text
        </Headline>
        <Box
          css={{
            bg: "neutral.900",
            color: "white",
            p: "4",
            borderRadius: "md",
            fontFamily: "mono",
            fontSize: "sm",
            mb: "4",
          }}
        >
          <pre>
            {`import { Box } from '@httpjpg/ui';

<Box css={{ fontFamily: 'mono', fontSize: 'xs' }}>
  2024-03-15 | Status: Active
</Box>`}
          </pre>
        </Box>
        <Box css={{ p: "4", bg: "neutral.50", borderRadius: "md" }}>
          <Box css={{ fontFamily: "mono", fontSize: "xs" }}>
            2024-03-15 | Status: Active | Version: 1.0.0
          </Box>
        </Box>
      </Box>
    </Box>
  ),
};
