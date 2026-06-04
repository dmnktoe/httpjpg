import { Box, Headline, Paragraph } from "@httpjpg/ui";
import type { Meta } from "@storybook/react";
import type { ReactNode } from "react";

const meta = {
  title: "Foundations/Typography",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

interface FontSizeRowProps {
  size: string;
  rem: string;
  px: string;
  desc: string;
  children: ReactNode;
}

function FontSizeRow({ size, rem, px, desc, children }: FontSizeRowProps) {
  return (
    <Box css={{ p: "4", bg: "neutral.50", borderRadius: "md" }}>
      <Box css={{ display: "flex", alignItems: "baseline", gap: "4", mb: "2" }}>
        <Paragraph css={{ fontFamily: "mono", fontSize: "sm", fontWeight: "bold" }}>
          {size}
        </Paragraph>
        <Paragraph css={{ opacity: 0.6, fontFamily: "mono", fontSize: "xs" }}>
          {rem} ({px})
        </Paragraph>
        <Paragraph css={{ opacity: 0.6, fontSize: "xs" }}>- {desc}</Paragraph>
      </Box>
      {children}
    </Box>
  );
}

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
      <Headline level={2} css={{ mt: "12", mb: "6" }}>
        FONT FAMILIES
      </Headline>

      <Box css={{ mb: "8" }}>
        <Headline level={3} css={{ mb: "4" }}>
          Sans Serif (Body Text)
        </Headline>
        <Paragraph css={{ mb: "2" }}>Default font family for body text and UI elements.</Paragraph>
        <Paragraph css={{ mb: "4", fontFamily: "mono", fontSize: "sm" }}>
          Stack: Arial, Helvetica, sans-serif
        </Paragraph>
        <Box
          css={{ p: "4", fontFamily: "sans", fontSize: "lg", bg: "neutral.50", borderRadius: "md" }}
        >
          The quick brown fox jumps over the lazy dog. 0123456789
        </Box>
      </Box>

      <Box css={{ mb: "8" }}>
        <Headline level={3} css={{ mb: "4" }}>
          Headline (Impact)
        </Headline>
        <Paragraph css={{ mb: "2" }}>Bold, impactful font for headlines and large text.</Paragraph>
        <Paragraph css={{ mb: "4", fontFamily: "mono", fontSize: "sm" }}>
          Stack: Impact, Haettenschweiler, Arial Narrow Bold, sans-serif
        </Paragraph>
        <Box
          css={{
            p: "4",
            fontFamily: "headline",
            fontSize: "4xl",
            textTransform: "uppercase",
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
          Elegant handwritten/script font for special moments and decorative text.
        </Paragraph>
        <Paragraph css={{ mb: "4", fontFamily: "mono", fontSize: "sm" }}>
          Stack: Trattatello, Snell Roundhand, Bradley Hand, Brush Script MT, cursive
        </Paragraph>
        <Box
          css={{
            p: "4",
            fontFamily: "accent",
            fontSize: "2xl",
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
          Stack: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
        </Paragraph>
        <Box
          css={{
            p: "4",
            color: "white",
            fontFamily: "mono",
            fontSize: "sm",
            bg: "neutral.900",
            borderRadius: "md",
          }}
        >
          The quick brown fox jumps over the lazy dog. 0123456789
        </Box>
      </Box>

      {/* Font Sizes */}
      <Headline level={2} css={{ mt: "12", mb: "6" }}>
        FONT SIZES
      </Headline>

      <Box css={{ display: "flex", flexDirection: "column", gap: "4", mb: "8" }}>
        <FontSizeRow size="xs" rem="0.75rem" px="12px" desc="Small text, captions">
          <Box css={{ fontSize: "xs" }}>The quick brown fox</Box>
        </FontSizeRow>
        <FontSizeRow size="sm" rem="0.875rem" px="14px" desc="Secondary text">
          <Box css={{ fontSize: "sm" }}>The quick brown fox</Box>
        </FontSizeRow>
        <FontSizeRow size="base" rem="1rem" px="16px" desc="Body text (default)">
          <Box css={{ fontSize: "base" }}>The quick brown fox</Box>
        </FontSizeRow>
        <FontSizeRow size="lg" rem="1.125rem" px="18px" desc="Emphasized body text">
          <Box css={{ fontSize: "lg" }}>The quick brown fox</Box>
        </FontSizeRow>
        <FontSizeRow size="xl" rem="1.25rem" px="20px" desc="Small headings">
          <Box css={{ fontSize: "xl" }}>The quick brown fox</Box>
        </FontSizeRow>
        <FontSizeRow size="2xl" rem="1.5rem" px="24px" desc="Section headings">
          <Box css={{ fontSize: "2xl" }}>The quick brown fox</Box>
        </FontSizeRow>
        <FontSizeRow size="3xl" rem="1.875rem" px="30px" desc="Page headings">
          <Box css={{ fontSize: "3xl" }}>The quick brown fox</Box>
        </FontSizeRow>
        <FontSizeRow size="4xl" rem="2.25rem" px="36px" desc="Large headings">
          <Box css={{ fontSize: "4xl" }}>The quick brown fox</Box>
        </FontSizeRow>
        <FontSizeRow size="5xl" rem="3rem" px="48px" desc="Hero headings">
          <Box css={{ fontSize: "5xl" }}>The quick brown fox</Box>
        </FontSizeRow>
        <FontSizeRow size="6xl" rem="3.75rem" px="60px" desc="Display text">
          <Box css={{ fontSize: "6xl" }}>The quick brown fox</Box>
        </FontSizeRow>
      </Box>

      {/* Font Weights */}
      <Headline level={2} css={{ mt: "12", mb: "6" }}>
        FONT WEIGHTS
      </Headline>

      <Box css={{ display: "flex", flexDirection: "column", gap: "3", mb: "12" }}>
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
          <Box key={weight} css={{ fontSize: "lg", fontWeight: weight }}>
            {name} ({weight}) - The quick brown fox
          </Box>
        ))}
      </Box>

      {/* Letter Spacing */}
      <Headline level={2} css={{ mt: "12", mb: "6" }}>
        LETTER SPACING
      </Headline>

      <Box css={{ display: "flex", flexDirection: "column", gap: "3", mb: "12" }}>
        {[
          { spacing: "-0.05em", name: "Tighter" },
          { spacing: "-0.025em", name: "Tight" },
          { spacing: "0em", name: "Normal" },
          { spacing: "0.025em", name: "Wide" },
          { spacing: "0.05em", name: "Wider" },
          { spacing: "0.1em", name: "Widest" },
        ].map(({ spacing, name }) => (
          <Box key={spacing} css={{ fontSize: "lg", letterSpacing: spacing }}>
            {name} ({spacing}) - The quick brown fox
          </Box>
        ))}
      </Box>

      {/* Line Heights */}
      <Headline level={2} css={{ mt: "12", mb: "6" }}>
        LINE HEIGHTS
      </Headline>

      <Box css={{ display: "flex", flexDirection: "column", gap: "6", mb: "12" }}>
        {[
          { height: 1, name: "None" },
          { height: 1.25, name: "Tight" },
          { height: 1.375, name: "Snug" },
          { height: 1.5, name: "Normal" },
          { height: 1.625, name: "Relaxed" },
          { height: 2, name: "Loose" },
        ].map(({ height, name }) => (
          <Box key={height}>
            <Paragraph css={{ mb: "2", fontWeight: "bold" }}>
              {name} ({height})
            </Paragraph>
            <Box css={{ p: "4", lineHeight: height, bg: "neutral.50", borderRadius: "md" }}>
              The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Sed do eiusmod tempor incididunt.
            </Box>
          </Box>
        ))}
      </Box>

      {/* Usage Examples */}
      <Headline level={2} css={{ mt: "12", mb: "6" }}>
        USAGE EXAMPLES
      </Headline>

      <Box css={{ mb: "8" }}>
        <Headline level={3} css={{ mb: "4" }}>
          Headlines
        </Headline>
        <Box
          css={{
            mb: "4",
            p: "4",
            color: "white",
            fontFamily: "mono",
            fontSize: "sm",
            bg: "neutral.900",
            borderRadius: "md",
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
            mb: "4",
            p: "4",
            color: "white",
            fontFamily: "mono",
            fontSize: "sm",
            bg: "neutral.900",
            borderRadius: "md",
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
            display: "flex",
            flexDirection: "column",
            gap: "3",
            p: "4",
            bg: "neutral.50",
            borderRadius: "md",
          }}
        >
          <Paragraph>Small (default): Body text with optimal readability</Paragraph>
          <Paragraph size="md">Medium: Emphasized body text</Paragraph>
          <Paragraph size="lg">Large: Lead paragraph or important text</Paragraph>
        </Box>
      </Box>

      <Box>
        <Headline level={3} css={{ mb: "4" }}>
          Technical Text
        </Headline>
        <Box
          css={{
            mb: "4",
            p: "4",
            color: "white",
            fontFamily: "mono",
            fontSize: "sm",
            bg: "neutral.900",
            borderRadius: "md",
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
