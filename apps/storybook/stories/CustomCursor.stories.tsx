import {
  Box,
  Button,
  CustomCursor,
  Headline,
  Link,
  Paragraph,
} from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Custom Cursor component stories
 *
 * Interactive brutalist cursor that replaces the default browser cursor.
 * Responds to hover states and can display labels on interactive elements.
 */
const meta = {
  title: "Animation & Effects/CustomCursor",
  component: CustomCursor,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "range", min: 12, max: 48, step: 2 },
      description: "ASCII symbol size in pixels",
      table: {
        defaultValue: { summary: "24" },
      },
    },
    color: {
      control: "color",
      description: "Cursor color",
      table: {
        defaultValue: { summary: "black" },
      },
    },
    symbol: {
      control: "text",
      description: "ASCII symbol to use as cursor",
      table: {
        defaultValue: { summary: "✦" },
      },
    },
    showLabel: {
      control: "boolean",
      description: "Show text labels on hover",
      table: {
        defaultValue: { summary: "true" },
      },
    },
  },
  decorators: [
    (Story) => (
      <Box css={{ minH: "100vh", p: "64px", bg: "white" }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof CustomCursor>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default cursor with standard settings
 */
export const Default: Story = {
  render: (args) => (
    <>
      <CustomCursor {...args} />
      <Box css={{ maxW: "800px", mx: "auto" }}>
        <Headline level={1}>CUSTOM CURSOR DEMO</Headline>
        <Paragraph css={{ mt: "24px", mb: "32px" }}>
          Move your mouse around to see the custom cursor in action. Hover over
          interactive elements to see the cursor respond.
        </Paragraph>

        <Box css={{ display: "flex", gap: "16px", mb: "32px" }}>
          <Button>Hover Me</Button>
          <Button>Click Me</Button>
        </Box>

        <Paragraph css={{ mb: "16px" }}>
          Here's a <Link href="#">regular link</Link> to see hover states.
        </Paragraph>

        <Paragraph>
          The cursor uses mix-blend-mode for a brutalist look and responds to
          all interactive elements on the page.
        </Paragraph>
      </Box>
    </>
  ),
  args: {},
};

/**
 * With custom labels on interactive elements
 */
export const WithLabels: Story = {
  render: (args) => (
    <>
      <CustomCursor {...args} />
      <Box css={{ maxW: "800px", mx: "auto" }}>
        <Headline level={1}>HOVER LABELS</Headline>
        <Paragraph css={{ mt: "24px", mb: "32px" }}>
          Add <code>data-cursor="text"</code> attribute to show custom labels.
        </Paragraph>

        <Box
          css={{ display: "flex", gap: "16px", mb: "32px", flexWrap: "wrap" }}
        >
          <Button data-cursor="CLICK">Primary Action</Button>
          <Button data-cursor="VIEW MORE">Secondary Action</Button>
          <Box
            as="button"
            data-cursor="DOWNLOAD"
            css={{
              px: "24px",
              py: "12px",
              bg: "white",
              border: "2px solid black",
              cursor: "pointer",
            }}
          >
            Custom Button
          </Box>
        </Box>

        <Box
          data-cursor="EXPLORE"
          css={{
            p: "32px",
            bg: "neutral.50",
            border: "2px solid black",
            mb: "32px",
          }}
        >
          <Headline level={3}>Interactive Area</Headline>
          <Paragraph>This entire box has a custom cursor label.</Paragraph>
        </Box>
      </Box>
    </>
  ),
  args: {
    showLabel: true,
  },
};

/**
 * Large ASCII symbols
 */
export const LargeSymbols: Story = {
  render: (args) => (
    <>
      <CustomCursor {...args} />
      <Box css={{ maxW: "800px", mx: "auto" }}>
        <Headline level={1}>LARGE SYMBOLS</Headline>
        <Paragraph css={{ mt: "24px", mb: "32px" }}>
          Bigger ASCII cursor symbols for dramatic effect.
        </Paragraph>

        <Box css={{ display: "flex", gap: "16px", mb: "32px" }}>
          <Button data-cursor="CLICK">Large Button</Button>
          <Link href="#" data-cursor="HOVER">
            Large Link
          </Link>
        </Box>
      </Box>
    </>
  ),
  args: {
    size: 40,
  },
};

/**
 * Small symbols
 */
export const SmallSymbols: Story = {
  render: (args) => (
    <>
      <CustomCursor {...args} />
      <Box css={{ maxW: "800px", mx: "auto" }}>
        <Headline level={1}>SMALL SYMBOLS</Headline>
        <Paragraph css={{ mt: "24px", mb: "32px" }}>
          Smaller ASCII cursor for subtle interactions.
        </Paragraph>

        <Box css={{ display: "flex", gap: "16px", mb: "32px" }}>
          <Button data-cursor="CLICK">Small Button</Button>
          <Button data-cursor="HOVER">Small Link</Button>
        </Box>
      </Box>
    </>
  ),
  args: {
    size: 16,
  },
};

/**
 * White cursor on dark background
 */
export const DarkMode: Story = {
  render: (args) => (
    <>
      <CustomCursor {...args} />
      <Box css={{ maxW: "800px", mx: "auto" }}>
        <Headline level={1} css={{ color: "white" }}>
          DARK MODE CURSOR
        </Headline>
        <Paragraph css={{ mt: "24px", mb: "32px", color: "white" }}>
          White cursor with mix-blend-mode for dark backgrounds.
        </Paragraph>

        <Box css={{ display: "flex", gap: "16px", mb: "32px" }}>
          <Button data-cursor="LIGHT">Light Button</Button>
          <Box
            as="button"
            data-cursor="INVERTED"
            css={{
              px: "24px",
              py: "12px",
              bg: "transparent",
              border: "2px solid white",
              color: "white",
              cursor: "pointer",
            }}
          >
            Ghost Button
          </Box>
        </Box>
      </Box>
    </>
  ),
  args: {
    color: "white",
  },
  decorators: [
    (Story) => (
      <Box css={{ minH: "100vh", p: "64px", bg: "black" }}>
        <Story />
      </Box>
    ),
  ],
};

/**
 * Without labels (minimal)
 */
export const NoLabels: Story = {
  render: (args) => (
    <>
      <CustomCursor {...args} />
      <Box css={{ maxW: "800px", mx: "auto" }}>
        <Headline level={1}>MINIMAL CURSOR</Headline>
        <Paragraph css={{ mt: "24px", mb: "32px" }}>
          Clean cursor without hover labels.
        </Paragraph>

        <Box css={{ display: "flex", gap: "16px", mb: "32px" }}>
          <Button>Simple Button</Button>
          <Link href="#">Simple Link</Link>
        </Box>
      </Box>
    </>
  ),
  args: {
    showLabel: false,
  },
};

/**
 * With image preview on hover (like work navigation)
 */
export const WithImagePreview: Story = {
  render: (args) => (
    <>
      <CustomCursor {...args} />
      <Box css={{ maxW: "800px", mx: "auto" }}>
        <Headline level={1}>WORK PREVIEW CURSOR</Headline>
        <Paragraph css={{ mt: "24px", mb: "32px" }}>
          Hover over the links below to see work preview images follow your
          cursor.
        </Paragraph>

        <Box
          css={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            mb: "32px",
          }}
        >
          <Link
            href="#"
            data-cursor-image="https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/600x400/smart/filters:quality(75)"
            data-cursor="VIEW PROJECT"
            css={{
              fontSize: "xl",
              fontWeight: "bold",
              textDecoration: "none",
              _hover: { textDecoration: "underline" },
            }}
          >
            ✦ BRUTALIST PORTFOLIO 2024
          </Link>

          <Link
            href="#"
            data-cursor-image="https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/600x400/smart/filters:quality(75)"
            data-cursor="EXPLORE"
            css={{
              fontSize: "xl",
              fontWeight: "bold",
              textDecoration: "none",
              _hover: { textDecoration: "underline" },
            }}
          >
            ◆ DESIGN SYSTEM PROJECT
          </Link>

          <Link
            href="#"
            data-cursor-image="https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/600x400/smart/filters:quality(75)"
            data-cursor="DISCOVER"
            css={{
              fontSize: "xl",
              fontWeight: "bold",
              textDecoration: "none",
              _hover: { textDecoration: "underline" },
            }}
          >
            ✧ INTERACTIVE EXPERIENCE
          </Link>

          <Link
            href="#"
            data-cursor-image="https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg/m/600x400/smart/filters:quality(75)"
            data-cursor="SEE MORE"
            css={{
              fontSize: "xl",
              fontWeight: "bold",
              textDecoration: "none",
              _hover: { textDecoration: "underline" },
            }}
          >
            ⬥ EXHIBITION PHOTOGRAPHY
          </Link>
        </Box>

        <Paragraph css={{ fontSize: "sm", opacity: 0.7 }}>
          This demonstrates the cursor follow feature used in the header
          navigation. Each work item can have a preview image that appears next
          to the cursor on hover.
        </Paragraph>
      </Box>
    </>
  ),
  args: {},
};

/**
 * Interactive playground
 */
export const Playground: Story = {
  render: (args) => (
    <>
      <CustomCursor {...args} />
      <Box css={{ maxW: "1200px", mx: "auto" }}>
        <Headline level={1}>CURSOR PLAYGROUND</Headline>
        <Paragraph css={{ mt: "24px", mb: "48px" }}>
          Interact with various elements to test cursor behavior.
        </Paragraph>

        <Box
          css={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "32px",
            mb: "48px",
          }}
        >
          <Box data-cursor="CARD 01" css={{ p: "32px", bg: "neutral.50" }}>
            <Headline level={3}>Card One</Headline>
            <Paragraph>Hover this card</Paragraph>
          </Box>

          <Box data-cursor="CARD 02" css={{ p: "32px", bg: "primary.50" }}>
            <Headline level={3}>Card Two</Headline>
            <Paragraph>Hover this card</Paragraph>
          </Box>

          <Box data-cursor="CARD 03" css={{ p: "32px", bg: "accent.50" }}>
            <Headline level={3}>Card Three</Headline>
            <Paragraph>Hover this card</Paragraph>
          </Box>
        </Box>

        <Box css={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Button data-cursor="PRIMARY">Primary</Button>
          <Button data-cursor="SECONDARY">Secondary</Button>
          <Button data-cursor="TERTIARY">Tertiary</Button>
          <Link href="#" data-cursor="NAVIGATE">
            Link
          </Link>
          <Box
            as="input"
            type="text"
            placeholder="Input field"
            data-cursor="TYPE"
            css={{
              px: "16px",
              py: "12px",
              border: "2px solid black",
              outline: "none",
            }}
          />
        </Box>
      </Box>
    </>
  ),
  args: {},
};
