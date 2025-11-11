import { Box, Container, Headline, Paragraph, Section } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Section component stories
 *
 * A semantic section wrapper with consistent spacing.
 * Perfect for organizing portfolio content and creating visual rhythm.
 */
const meta = {
  title: "Layout/Section",
  component: Section,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    pt: {
      control: { type: "select" },
      options: [0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
      description: "Padding top (using token scale)",
      table: {
        defaultValue: { summary: "16" },
      },
    },
    pb: {
      control: { type: "select" },
      options: [0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
      description: "Padding bottom (using token scale)",
      table: {
        defaultValue: { summary: "16" },
      },
    },
    pl: {
      control: { type: "select" },
      options: [0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
      description: "Padding left (using token scale)",
      table: {
        defaultValue: { summary: "0" },
      },
    },
    pr: {
      control: { type: "select" },
      options: [0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
      description: "Padding right (using token scale)",
      table: {
        defaultValue: { summary: "0" },
      },
    },
    fullWidth: {
      control: "boolean",
      description: "Full width",
      table: {
        defaultValue: { summary: "true" },
      },
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic section with default padding
 */
export const Basic: Story = {
  args: {
    pt: 16,
    pb: 16,
    children: (
      <Container>
        <Headline level={2}>Section Title</Headline>
        <Paragraph style={{ marginTop: "1rem" }}>
          This is a basic section with default padding. Sections help organize
          content with consistent vertical rhythm.
        </Paragraph>
      </Container>
    ),
  },
};

/**
 * Large padding for hero sections
 */
export const LargePadding: Story = {
  args: {
    pt: 32,
    pb: 32,
    children: (
      <Container>
        <Box style={{ textAlign: "center" }}>
          <Box
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              marginBottom: "1rem",
              opacity: 0.5,
            }}
          >
            HERO SECTION
          </Box>
          <Headline level={1} style={{ fontSize: "3rem", margin: 0 }}>
            LARGE SPACING
          </Headline>
          <Paragraph style={{ marginTop: "1.5rem", fontSize: "1.125rem" }}>
            Use large padding for hero sections and important content areas.
          </Paragraph>
        </Box>
      </Container>
    ),
  },
};

/**
 * Compact section with minimal padding
 */
export const Compact: Story = {
  args: {
    pt: 4,
    pb: 4,
    children: (
      <Container>
        <Headline level={3}>Compact Section</Headline>
        <Paragraph style={{ marginTop: "0.5rem" }}>
          Minimal padding for compact layouts.
        </Paragraph>
      </Container>
    ),
  },
};

/**
 * Section with horizontal padding
 */
export const WithHorizontalPadding: Story = {
  args: {
    pt: 16,
    pb: 16,
    pl: 8,
    pr: 8,
    children: (
      <Box>
        <Headline level={2}>Section with Horizontal Padding</Headline>
        <Paragraph style={{ marginTop: "1rem" }}>
          This section has horizontal padding in addition to vertical padding.
        </Paragraph>
      </Box>
    ),
  },
};

/**
 * Dark section with background
 */
export const DarkSection: Story = {
  args: {
    pt: 24,
    pb: 24,
    style: { background: "#171717" },
    children: (
      <Container>
        <Box
          style={{
            fontFamily: "monospace",
            fontSize: "0.75rem",
            color: "white",
            marginBottom: "1rem",
            opacity: 0.7,
          }}
        >
          DARK MODE / 2025
        </Box>
        <Headline level={2} style={{ color: "white", margin: 0 }}>
          Dark Section
        </Headline>
        <Paragraph
          style={{
            color: "white",
            marginTop: "1rem",
            fontSize: "1rem",
            opacity: 0.9,
          }}
        >
          Sections can have custom backgrounds and styling for visual variety.
        </Paragraph>
      </Container>
    ),
  },
};

/**
 * Multiple sections with different backgrounds
 */
export const MultipleSections: Story = {
  render: () => (
    <>
      <Section pt={24} pb={24} style={{ background: "white" }}>
        <Container>
          <Box
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              marginBottom: "1rem",
              opacity: 0.5,
            }}
          >
            01 / INTRODUCTION
          </Box>
          <Headline level={2}>First Section</Headline>
          <Paragraph style={{ marginTop: "1rem" }}>
            White background section with standard spacing. Perfect for main
            content areas.
          </Paragraph>
        </Container>
      </Section>

      <Section pt={24} pb={24} style={{ background: "#f5f5f5" }}>
        <Container>
          <Box
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              marginBottom: "1rem",
              opacity: 0.5,
            }}
          >
            02 / PROJECTS
          </Box>
          <Headline level={2}>Second Section</Headline>
          <Paragraph style={{ marginTop: "1rem" }}>
            Light gray background creates visual separation between sections.
          </Paragraph>
        </Container>
      </Section>

      <Section pt={24} pb={24} style={{ background: "#171717" }}>
        <Container>
          <Box
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              color: "white",
              marginBottom: "1rem",
              opacity: 0.7,
            }}
          >
            03 / CONTACT
          </Box>
          <Headline level={2} style={{ color: "white", margin: 0 }}>
            Third Section
          </Headline>
          <Paragraph
            style={{
              color: "white",
              marginTop: "1rem",
              fontSize: "1rem",
              opacity: 0.9,
            }}
          >
            Dark background for high contrast and impact. Great for CTAs and
            footer areas.
          </Paragraph>
        </Container>
      </Section>
    </>
  ),
};

/**
 * Brutalist portfolio section
 */
export const BrutalistPortfolio: Story = {
  render: () => (
    <Section pt={32} pb={32} style={{ background: "white" }}>
      <Container>
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "4rem",
          }}
        >
          {/* Left column */}
          <Box style={{ flex: 1 }}>
            <Box
              style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                marginBottom: "1rem",
                opacity: 0.5,
              }}
            >
              SELECTED WORK / 2024-2025
            </Box>
            <Headline
              level={1}
              style={{ fontSize: "3rem", margin: 0, lineHeight: 1.1 }}
            >
              PORTFOLIO
            </Headline>
          </Box>

          {/* Right column */}
          <Box style={{ flex: 1, paddingTop: "1rem" }}>
            <Paragraph
              style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.8 }}
            >
              A collection of brutalist design work showcasing bold typography,
              strong visual hierarchy, and minimalist aesthetics.
            </Paragraph>
          </Box>
        </Box>

        {/* Projects grid */}
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
            marginTop: "4rem",
          }}
        >
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              style={{
                border: "2px solid black",
                background: i === 2 ? "#171717" : "white",
              }}
            >
              <Box
                style={{
                  aspectRatio: "4/3",
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: "2px solid black",
                }}
              >
                <Box
                  style={{
                    fontFamily: "monospace",
                    fontSize: "2rem",
                    opacity: 0.2,
                  }}
                >
                  {String(i).padStart(2, "0")}
                </Box>
              </Box>
              <Box style={{ padding: "1.5rem" }}>
                <Headline
                  level={3}
                  style={{
                    margin: 0,
                    fontSize: "1.25rem",
                    color: i === 2 ? "white" : "black",
                  }}
                >
                  Project {i}
                </Headline>
                <Paragraph
                  style={{
                    margin: 0,
                    marginTop: "0.5rem",
                    fontSize: "0.875rem",
                    color: i === 2 ? "white" : "black",
                    opacity: 0.8,
                  }}
                >
                  Editorial Design
                </Paragraph>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Section>
  ),
};

/**
 * No padding - full bleed section
 */
export const FullBleed: Story = {
  args: {
    pt: 0,
    pb: 0,
    style: { background: "#171717" },
    children: (
      <Box
        style={{
          aspectRatio: "21/9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Headline level={1} style={{ color: "white", fontSize: "4rem" }}>
          FULL BLEED
        </Headline>
      </Box>
    ),
  },
};
