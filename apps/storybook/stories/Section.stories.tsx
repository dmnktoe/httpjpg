import { Box, Container, Headline, Paragraph, Section } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { extendedSpacingArgType } from "./storybook-helpers";

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
    pt: extendedSpacingArgType("Padding top (using token scale)", "16"),
    pb: extendedSpacingArgType("Padding bottom (using token scale)", "16"),
    pl: extendedSpacingArgType("Padding left (using token scale)", "0"),
    pr: extendedSpacingArgType("Padding right (using token scale)", "0"),
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
 * Basic section with live controls
 */
export const Basic: Story = {
  args: {
    pt: 16,
    pb: 16,
    pl: 0,
    pr: 0,
    fullWidth: true,
    children: null,
  },
  render: (args) => (
    <Section
      pt={args.pt}
      pb={args.pb}
      pl={args.pl}
      pr={args.pr}
      fullWidth={args.fullWidth}
    >
      <Container>
        <Headline level={2}>Section Title</Headline>
        <Paragraph css={{ mt: "4" }}>
          This is a basic section with configurable padding. Use the controls to
          adjust spacing and see how it affects the layout.
        </Paragraph>
      </Container>
    </Section>
  ),
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
        <Box css={{ textAlign: "center" }}>
          <Box
            css={{ fontFamily: "mono", fontSize: "xs", mb: "4", opacity: 0.5 }}
          >
            HERO SECTION
          </Box>
          <Headline level={1} css={{ fontSize: "3rem", m: 0 }}>
            LARGE SPACING
          </Headline>
          <Paragraph
            align="center"
            maxWidth={false}
            css={{ mt: "6", fontSize: "lg" }}
          >
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
        <Paragraph css={{ mt: "2" }}>
          Minimal padding for compact layouts.
        </Paragraph>
      </Container>
    ),
  },
};

/**
 * With horizontal padding
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
        <Paragraph css={{ mt: "4" }}>
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
  args: {
    children: null,
  },
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
  args: {
    children: null,
  },
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
                fontSize: "0.65rem",
                marginBottom: "1rem",
                opacity: 0.6,
                letterSpacing: "0.1em",
              }}
            >
              ⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S / 2024-2025
            </Box>
            <Headline
              level={1}
              style={{
                fontSize: "3rem",
                margin: 0,
                lineHeight: 1.1,
                fontWeight: 600,
              }}
            >
              🎀 ୧ꔛꗃ˖ PORTFOLIO ･ﾟ⋆
            </Headline>
          </Box>

          {/* Right column */}
          <Box style={{ flex: 1, paddingTop: "1rem" }}>
            <Paragraph
              style={{
                margin: 0,
                fontSize: "0.875rem",
                lineHeight: 1.8,
                opacity: 0.8,
              }}
            >
              ⋆.˚ ᡣ𐭩 A collection of modern design work showcasing bold
              typography, strong visual hierarchy, and clean aesthetics ⋆.˚✮
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
          {[
            {
              id: 1,
              img: "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)",
            },
            {
              id: 2,
              img: "https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)",
            },
            {
              id: 3,
              img: "https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)",
            },
          ].map((project) => (
            <Box
              key={project.id}
              style={{
                background: "transparent",
              }}
            >
              <Box
                style={{
                  aspectRatio: "4/3",
                  overflow: "hidden",
                }}
              >
                <img
                  src={project.img}
                  alt={`Project ${project.id}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
              <Box style={{ padding: "1.5rem 0" }}>
                <Box
                  style={{
                    fontSize: "0.65rem",
                    marginBottom: "0.5rem",
                    opacity: 0.6,
                    letterSpacing: "0.1em",
                  }}
                >
                  ⇝ PROJECT / {String(project.id).padStart(2, "0")}
                </Box>
                <Headline
                  level={3}
                  style={{
                    margin: 0,
                    fontSize: "1.25rem",
                    fontWeight: 600,
                  }}
                >
                  ⋆.˚ ᡣ𐭩 Work {project.id}
                </Headline>
                <Paragraph
                  style={{
                    margin: 0,
                    marginTop: "0.5rem",
                    fontSize: "0.875rem",
                    opacity: 0.8,
                  }}
                >
                  🎀 ୧ꔛꗃ˖ Editorial Design
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
