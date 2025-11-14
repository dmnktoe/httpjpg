import { Box, Footer, Link, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Footer component stories
 *
 * Site footer with background texture support and ASCII art styling.
 * Perfect for brutalist design with centered content and optional links.
 */
const meta = {
  title: "Layout/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    backgroundImage: {
      control: "text",
      description: "Background image URL",
    },
    showDefaultLinks: {
      control: "boolean",
      description: "Show default Legal and Privacy links",
      table: {
        defaultValue: { summary: "true" },
      },
    },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default footer with background image
 */
export const Default: Story = {
  args: {
    backgroundImage: "https://www.httpjpg.com/images/footer_bg.png",
  },
};

/**
 * Footer without background image
 */
export const NoBackground: Story = {
  args: {
    showDefaultLinks: true,
  },
  render: (args) => <Footer {...args} css={{ bg: "neutral.100" }} />,
};

/**
 * Footer with custom content
 */
export const CustomContent: Story = {
  args: {
    backgroundImage: "https://www.httpjpg.com/images/footer_bg.png",
    showDefaultLinks: false,
  },
  render: (args) => (
    <Footer {...args}>
      <Box
        css={{
          filter: "drop-shadow(0 35px 35px rgba(0,0,0,0.25))",
        }}
      >
        <Paragraph css={{ mb: "4" }}>
          🎀 ୧ꔛꗃ˖ Custom Footer Content ･ﾟ⋆
        </Paragraph>
        <Box css={{ fontSize: "sm", opacity: 0.8 }}>
          <Link href="/about">About</Link>
          {" · "}
          <Link href="/contact">Contact</Link>
          {" · "}
          <Link href="/work">Work</Link>
        </Box>
        <Box css={{ mt: "6", fontSize: "xs" }}>⋆.˚ ᡣ𐭩 httpjpg × 2025 ･ﾟ⋆</Box>
      </Box>
    </Footer>
  ),
};

/**
 * Footer with multiple sections
 */
export const MultiSection: Story = {
  args: {
    backgroundImage: "https://www.httpjpg.com/images/footer_bg.png",
    showDefaultLinks: false,
  },
  render: (args) => (
    <Footer {...args}>
      <Box
        css={{
          filter: "drop-shadow(0 35px 35px rgba(0,0,0,0.25))",
          display: "flex",
          flexDirection: { base: "column", md: "row" },
          justifyContent: "center",
          gap: "12",
          textAlign: { base: "center", md: "left" },
        }}
      >
        {/* Navigation */}
        <Box>
          <Box
            css={{
              fontSize: "xs",
              mb: "4",
              opacity: 0.5,
              letterSpacing: "0.15em",
            }}
          >
            NAVIGATION
          </Box>
          <Box css={{ fontSize: "sm" }}>
            <Link href="/">Home</Link>
            <br />
            <Link href="/about">About</Link>
            <br />
            <Link href="/work">Work</Link>
            <br />
            <Link href="/contact">Contact</Link>
          </Box>
        </Box>

        {/* Legal */}
        <Box>
          <Box
            css={{
              fontSize: "xs",
              mb: "4",
              opacity: 0.5,
              letterSpacing: "0.15em",
            }}
          >
            LEGAL
          </Box>
          <Box css={{ fontSize: "sm" }}>
            <Link href="/legal">Legal</Link>
            <br />
            <Link href="/privacy">Privacy</Link>
            <br />
            <Link href="/terms">Terms</Link>
          </Box>
        </Box>

        {/* Social */}
        <Box>
          <Box
            css={{
              fontSize: "xs",
              mb: "4",
              opacity: 0.5,
              letterSpacing: "0.15em",
            }}
          >
            SOCIAL
          </Box>
          <Box css={{ fontSize: "sm" }}>
            <Link href="https://instagram.com" isExternal>
              Instagram
            </Link>
            <br />
            <Link href="https://twitter.com" isExternal>
              Twitter
            </Link>
            <br />
            <Link href="https://github.com" isExternal>
              GitHub
            </Link>
          </Box>
        </Box>
      </Box>

      {/* ASCII Divider */}
      <Box css={{ mt: "12", mb: "6" }}>*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚</Box>

      {/* Copyright */}
      <Box css={{ fontSize: "xs", opacity: 0.6 }}>
        ༺yl33ly httpjpg icon.icon.iconn te3shay༻
        <br />© 2025 httpjpg
      </Box>
    </Footer>
  ),
};

/**
 * Minimal footer
 */
export const Minimal: Story = {
  args: {
    showDefaultLinks: false,
  },
  render: (args) => (
    <Footer {...args} css={{ py: "12", bg: "neutral.50" }}>
      <Box css={{ fontSize: "sm", opacity: 0.7 }}>⋆.˚ httpjpg × 2025 ･ﾟ⋆</Box>
    </Footer>
  ),
};

/**
 * Footer in dark mode
 */
export const DarkMode: Story = {
  args: {
    backgroundImage: "https://www.httpjpg.com/images/footer_bg.png",
    showDefaultLinks: true,
  },
  render: (args) => (
    <Footer
      {...args}
      css={{
        bg: "neutral.900",
        color: "white",
        borderTop: "1px solid",
        borderColor: "neutral.700",
      }}
    />
  ),
};
