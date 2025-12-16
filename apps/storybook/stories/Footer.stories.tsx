import { Box, Footer, Link, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Footer component stories
 *
 * Generic site footer with background texture support and flexible widget area.
 * The footer is designed to be composable - pass custom content via children
 * or use the default layout with links, widgets, and copyright text.
 */
const meta = {
  title: "Navigation/Footer",
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
    footerLinks: {
      control: "object",
      description: "Navigation links from CMS",
    },
    copyrightText: {
      control: "text",
      description: "Copyright text to display",
    },
    widgets: {
      control: false,
      description: "Widget area content (badges, status, etc.)",
    },
    showConsoleLink: {
      control: "boolean",
      description: "Show development console link",
    },
    showVersion: {
      control: "boolean",
      description: "Show version info",
    },
    version: {
      control: "text",
      description: "Version string to display",
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
    footerLinks: [
      { name: "Legal", href: "/legal", isExternal: false },
      { name: "Privacy", href: "/privacy", isExternal: false },
    ],
    copyrightText: "༺yl33ly httpjpg icon.icon.iconn te3shay༻",
    showVersion: true,
    version: "v1.0.0",
  },
};

/**
 * Footer with widget area
 */
export const WithWidgets: Story = {
  args: {
    backgroundImage: "https://www.httpjpg.com/images/footer_bg.png",
    footerLinks: [
      { name: "Legal", href: "/legal", isExternal: false },
      { name: "Privacy", href: "/privacy", isExternal: false },
    ],
    copyrightText: "© 2025 httpjpg",
    widgets: (
      <Box
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4",
        }}
      >
        {/* Mock Discord Status */}
        <Box
          css={{
            fontSize: "xs",
            fontFamily: "mono",
            opacity: 0.8,
          }}
        >
          discord: 🟢 <span style={{ color: "#22C55E" }}>online</span> · Playing
          Spotify
        </Box>

        {/* Flag Counter */}
        <Box as="span">
          <a href="https://info.flagcounter.com/ncez">
            <img
              src="https://s01.flagcounter.com/count2/ncez/bg_FFFFFF/txt_000000/border_CCCCCC/columns_3/maxflags_9/viewers_0/labels_0/pageviews_1/flags_0/percent_0/"
              alt="Flag Counter"
              style={{ border: 0 }}
            />
          </a>
        </Box>
      </Box>
    ),
    showVersion: true,
    version: "v1.0.0",
  },
};

/**
 * Footer without background image
 */
export const NoBackground: Story = {
  args: {
    footerLinks: [
      { name: "Legal", href: "/legal", isExternal: false },
      { name: "Privacy", href: "/privacy", isExternal: false },
    ],
  },
  render: (args) => <Footer {...args} css={{ bg: "neutral.100" }} />,
};

/**
 * Footer with custom content
 */
export const CustomContent: Story = {
  args: {
    backgroundImage: "https://www.httpjpg.com/images/footer_bg.png",
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
  args: {},
  render: (args) => (
    <Footer {...args} css={{ py: "12", bg: "neutral.50" }}>
      <Box css={{ fontSize: "sm", opacity: 0.7 }}>⋆.˚ httpjpg × 2025 ･ﾟ⋆</Box>
    </Footer>
  ),
};
