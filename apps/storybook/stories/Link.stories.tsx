import { Box, Link } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Link",
  component: Link,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "General-purpose Link component with Next.js Link integration and external link detection. Automatically handles internal routing and external links with proper security attributes. For Storyblok integration, see @httpjpg/storyblok-ui package.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    href: {
      control: "text",
      description: "Link destination (internal path or external URL)",
    },
    children: {
      control: "text",
      description: "Link content",
    },
    isExternal: {
      control: "boolean",
      description: "Force external link behavior (auto-detected by default)",
    },
    showExternalIcon: {
      control: "boolean",
      description: "Show external link icon (↗) for external links",
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic internal link using Next.js Link for client-side navigation
 */
export const Basic: Story = {
  args: {
    href: "/about",
    children: "About Us",
  },
};

/**
 * External link with automatic detection and security attributes
 */
export const External: Story = {
  args: {
    href: "https://github.com",
    children: "Visit GitHub",
  },
};

/**
 * External link without icon
 */
export const ExternalWithoutIcon: Story = {
  args: {
    href: "https://github.com",
    children: "Visit GitHub",
    showExternalIcon: false,
  },
};

/**
 * Email link with mailto protocol
 */
export const Email: Story = {
  args: {
    href: "mailto:hello@example.com",
    children: "Send Email",
  },
};

/**
 * Phone link with tel protocol
 */
export const Phone: Story = {
  args: {
    href: "tel:+1234567890",
    children: "Call Us",
  },
};

/**
 * Link with custom styles
 */
export const CustomStyles: Story = {
  args: {
    href: "/portfolio",
    children: "View Portfolio",
    css: {
      color: "blue.600",
      fontWeight: "bold",
      textDecoration: "underline",
      _hover: {
        color: "blue.800",
      },
    },
  },
};

/**
 * External client/agency link example
 */
export const ClientsExternal: Story = {
  args: {
    href: "https://www.behance.net/gallery/example",
    children: "View on Behance",
    isExternal: true,
  },
};

/**
 * Multiple links in different contexts
 */
export const MultipleLinks = {
  render: () => (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "4",
        fontSize: "lg",
      }}
    >
      <Link href="/home">Internal Link</Link>
      <Link href="https://example.com">External Link</Link>
      <Link href="mailto:test@example.com">Email Link</Link>
      <Link href="tel:+1234567890">Phone Link</Link>
      <Link
        href="/styled"
        css={{
          color: "purple.600",
          fontWeight: "bold",
          _hover: { color: "purple.800" },
        }}
      >
        Styled Link
      </Link>
    </Box>
  ),
};

/**
 * Links in paragraph context
 */
export const InParagraph = {
  render: () => (
    <Box css={{ maxW: "prose", fontSize: "base", lineHeight: "relaxed" }}>
      <p>
        This is a paragraph with an{" "}
        <Link
          href="/internal"
          css={{
            color: "blue.600",
            textDecoration: "underline",
            _hover: { color: "blue.800" },
          }}
        >
          internal link
        </Link>
        , an{" "}
        <Link
          href="https://example.com"
          css={{
            color: "blue.600",
            textDecoration: "underline",
            _hover: { color: "blue.800" },
          }}
        >
          external link
        </Link>
        , and an{" "}
        <Link
          href="mailto:hello@example.com"
          css={{
            color: "blue.600",
            textDecoration: "underline",
            _hover: { color: "blue.800" },
          }}
        >
          email link
        </Link>
        .
      </p>
    </Box>
  ),
};
