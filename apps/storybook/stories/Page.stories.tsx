import { Box, Headline, Page, Paragraph, Section } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Page component stories
 *
 * Full page layout with Header and Footer. Designed for Storyblok CMS integration.
 * Provides consistent structure across all pages.
 */
const meta = {
  title: "Layout/Page",
  component: Page,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for demos
const sampleNav = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Work", href: "/work" },
  { name: "Contact", href: "/contact" },
];

const samplePersonalWork = [
  { id: "1", slug: "project-alpha", title: "Project Alpha" },
  { id: "2", slug: "project-beta", title: "Project Beta" },
  { id: "3", slug: "creative-experiment", title: "Creative Experiment" },
];

const sampleClientWork = [
  { id: "4", slug: "brand-identity", title: "Brand Identity" },
  { id: "5", slug: "web-redesign", title: "Web Redesign" },
];

/**
 * Default page with header and footer
 */
export const Default: Story = {
  args: {
    header: {
      nav: sampleNav,
      personalWork: samplePersonalWork,
      clientWork: sampleClientWork,
    },
    footer: {
      backgroundImage: "https://www.httpjpg.com/images/footer_bg.png",
      showDefaultLinks: true,
    },
  },
  render: (args) => (
    <Page {...args}>
      <Section>
        <Headline level={1}>Welcome to httpjpg</Headline>
        <Paragraph>
          This is a demo page showcasing the Page component with Header and
          Footer. The layout is designed to be Storyblok-compatible for future
          CMS integration.
        </Paragraph>
        <Paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </Paragraph>
      </Section>
    </Page>
  ),
};

/**
 * Page with custom content sections
 */
export const WithSections: Story = {
  args: {
    header: {
      nav: sampleNav,
      personalWork: samplePersonalWork,
    },
    footer: {
      backgroundImage: "https://www.httpjpg.com/images/footer_bg.png",
    },
  },
  render: (args) => (
    <Page {...args}>
      {/* Hero Section */}
      <Section css={{ py: "32", bg: "neutral.50" }}>
        <Headline level={1} css={{ mb: "6" }}>
          Portfolio Showcase
        </Headline>
        <Paragraph css={{ fontSize: "lg", maxW: "2xl" }}>
          A curated collection of digital experiences, brand identities, and
          creative experiments. Each project tells a unique story.
        </Paragraph>
      </Section>

      {/* Content Section */}
      <Section css={{ py: "24" }}>
        <Headline level={2} css={{ mb: "8" }}>
          Recent Projects
        </Headline>
        <Box
          css={{
            display: "grid",
            gridTemplateColumns: { base: "1", md: "2", lg: "3" },
            gap: "8",
          }}
        >
          <Box
            css={{ p: "6", border: "1px solid", borderColor: "neutral.300" }}
          >
            <Headline level={3} css={{ mb: "4" }}>
              Project Alpha
            </Headline>
            <Paragraph css={{ fontSize: "sm" }}>
              Brand identity and web design for a tech startup.
            </Paragraph>
          </Box>
          <Box
            css={{ p: "6", border: "1px solid", borderColor: "neutral.300" }}
          >
            <Headline level={3} css={{ mb: "4" }}>
              Project Beta
            </Headline>
            <Paragraph css={{ fontSize: "sm" }}>
              E-commerce platform redesign with focus on UX.
            </Paragraph>
          </Box>
          <Box
            css={{ p: "6", border: "1px solid", borderColor: "neutral.300" }}
          >
            <Headline level={3} css={{ mb: "4" }}>
              Creative Experiment
            </Headline>
            <Paragraph css={{ fontSize: "sm" }}>
              Experimental web animations and interactions.
            </Paragraph>
          </Box>
        </Box>
      </Section>

      {/* Call to Action */}
      <Section
        css={{ py: "32", bg: "black", color: "white", textAlign: "center" }}
      >
        <Headline level={2} css={{ mb: "6" }}>
          Let's Work Together
        </Headline>
        <Paragraph css={{ fontSize: "lg", mb: "8" }}>
          Have a project in mind? Let's create something amazing.
        </Paragraph>
        <Box
          as="button"
          css={{
            px: "8",
            py: "4",
            bg: "white",
            color: "black",
            border: "2px solid white",
            cursor: "pointer",
            fontSize: "lg",
            fontWeight: "bold",
            transition: "all 0.2s",
            _hover: {
              bg: "black",
              color: "white",
            },
          }}
        >
          Get in Touch
        </Box>
      </Section>
    </Page>
  ),
};

/**
 * Minimal page (header only)
 */
export const HeaderOnly: Story = {
  args: {
    header: {
      nav: sampleNav,
    },
  },
  render: (args) => (
    <Page {...args}>
      <Section css={{ py: "32" }}>
        <Headline level={1}>Page with Header Only</Headline>
        <Paragraph>
          This page only includes the header navigation. Footer is omitted.
        </Paragraph>
      </Section>
    </Page>
  ),
};

/**
 * Minimal page (footer only)
 */
export const FooterOnly: Story = {
  args: {
    footer: {
      backgroundImage: "https://www.httpjpg.com/images/footer_bg.png",
    },
  },
  render: (args) => (
    <Page {...args}>
      <Section css={{ py: "32" }}>
        <Headline level={1}>Page with Footer Only</Headline>
        <Paragraph>
          This page only includes the footer. Header is omitted.
        </Paragraph>
      </Section>
    </Page>
  ),
};

/**
 * Content-only page (no header/footer)
 */
export const ContentOnly: Story = {
  render: () => (
    <Page>
      <Section css={{ py: "32" }}>
        <Headline level={1}>Standalone Content</Headline>
        <Paragraph>
          This page has no header or footer. Perfect for embedded content or
          special layouts.
        </Paragraph>
      </Section>
    </Page>
  ),
};
