import { Container, Headline, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { CONTAINER_SIZE_OPTIONS, spacingArgType } from "./storybook-helpers";

/**
 * Container component stories
 *
 * Max-width wrapper for centered content layouts with responsive sizing.
 */
const meta = {
  title: "Layout/Container",
  component: Container,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" as const },
      options: CONTAINER_SIZE_OPTIONS,
      description: "Container size preset",
      table: {
        defaultValue: { summary: "lg" },
      },
    },
    px: spacingArgType("Horizontal padding", "4"),
    center: {
      control: "boolean",
      description: "Center the container",
      table: {
        defaultValue: { summary: "true" },
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default container (lg size)
 */
export const Default: Story = {
  render: () => (
    <div
      style={{ background: "#f5f5f5", minHeight: "100vh", padding: "2rem 0" }}
    >
      <Container>
        <div style={{ background: "white", padding: "2rem" }}>
          <Headline level={1}>Container Content</Headline>
          <Paragraph style={{ marginTop: "1rem" }}>
            This container has a max-width of 1024px (lg) and is centered on the
            page.
          </Paragraph>
        </div>
      </Container>
    </div>
  ),
};

/**
 * Different container sizes
 */
export const Sizes: Story = {
  render: () => (
    <div
      style={{ background: "#f5f5f5", minHeight: "100vh", padding: "2rem 0" }}
    >
      <Container size="sm" py={4}>
        <div
          style={{
            background: "#e5e5e5",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          Small (640px)
        </div>
      </Container>

      <Container size="md" py={4}>
        <div
          style={{
            background: "#d4d4d4",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          Medium (768px)
        </div>
      </Container>

      <Container size="lg" py={4}>
        <div
          style={{
            background: "#c4c4c4",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          Large (1024px)
        </div>
      </Container>

      <Container size="xl" py={4}>
        <div
          style={{
            background: "#b4b4b4",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          Extra Large (1280px)
        </div>
      </Container>

      <Container size="2xl" py={4}>
        <div
          style={{
            background: "#a4a4a4",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          2XL (1536px)
        </div>
      </Container>

      <Container size="fluid" py={4}>
        <div
          style={{
            background: "#949494",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          Fluid (100%)
        </div>
      </Container>
    </div>
  ),
};

/**
 * Article layout
 */
export const ArticleLayout: Story = {
  render: () => (
    <Container size="md" py={16}>
      <Headline level={1}>Article Title</Headline>
      <Paragraph style={{ marginTop: "1rem", color: "#737373" }}>
        Published on November 11, 2025
      </Paragraph>
      <Paragraph style={{ marginTop: "2rem" }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </Paragraph>
      <Paragraph style={{ marginTop: "1rem" }}>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Paragraph>
    </Container>
  ),
};
