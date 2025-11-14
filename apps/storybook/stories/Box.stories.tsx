import { Box, Headline, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Box component stories
 *
 * Generic container component - the building block for all layouts.
 * Use it as a semantic wrapper with proper styling.
 */
const meta = {
  title: "Layout/Box",
  component: Box,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    as: {
      control: { type: "select" as const },
      options: [
        "div",
        "section",
        "article",
        "aside",
        "header",
        "footer",
        "main",
        "nav",
      ] as const,
      description: "Semantic HTML element to render",
      table: {
        defaultValue: { summary: "div" },
      },
    },
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic Box with live controls
 */
export const Basic: Story = {
  args: {
    as: "div",
    children: (
      <div>
        <Headline level={3}>Box Component</Headline>
        <Paragraph style={{ marginTop: "0.5rem" }}>
          A simple container with custom styling. Change the "as" control to
          render different semantic HTML elements.
        </Paragraph>
      </div>
    ),
    style: {
      background: "#f5f5f5",
      padding: "2rem",
      border: "2px solid #e5e5e5",
    },
  },
  render: (args) => <Box {...args} />,
};

/**
 * Old Basic (static)
 */
export const OldBasic: Story = {
  render: () => (
    <Box
      style={{
        background: "#f5f5f5",
        padding: "2rem",
        border: "2px solid #e5e5e5",
      }}
    >
      <Headline level={3}>Box Component</Headline>
      <Paragraph style={{ marginTop: "0.5rem" }}>
        A simple container with custom styling.
      </Paragraph>
    </Box>
  ),
};

/**
 * Semantic elements
 */
export const SemanticElements: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Box
        as="header"
        style={{
          background: "#171717",
          color: "white",
          padding: "1.5rem",
        }}
      >
        <Headline level={3} style={{ color: "white" }}>
          Header Element
        </Headline>
      </Box>

      <Box
        as="main"
        style={{
          background: "#f5f5f5",
          padding: "2rem",
          flex: 1,
        }}
      >
        <Headline level={3}>Main Content</Headline>
        <Paragraph style={{ marginTop: "0.5rem" }}>
          This is rendered as a {"<main>"} element.
        </Paragraph>
      </Box>

      <Box
        as="aside"
        style={{
          background: "#e5e5e5",
          padding: "1.5rem",
        }}
      >
        <Headline level={3}>Sidebar</Headline>
        <Paragraph style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
          Rendered as {"<aside>"}
        </Paragraph>
      </Box>

      <Box
        as="footer"
        style={{
          background: "#d4d4d4",
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <Paragraph style={{ fontSize: "0.875rem" }}>
          Footer Element - © 2025
        </Paragraph>
      </Box>
    </div>
  ),
};

/**
 * Nested Boxes
 */
export const NestedBoxes: Story = {
  render: () => (
    <Box
      style={{
        background: "#f43f5e",
        padding: "2rem",
      }}
    >
      <Headline level={3} style={{ color: "white" }}>
        Outer Box
      </Headline>
      <Box
        style={{
          background: "white",
          padding: "1.5rem",
          marginTop: "1rem",
        }}
      >
        <Headline level={3}>Inner Box</Headline>
        <Box
          style={{
            background: "#f5f5f5",
            padding: "1rem",
            marginTop: "1rem",
          }}
        >
          <Paragraph>Deeply nested box</Paragraph>
        </Box>
      </Box>
    </Box>
  ),
};

/**
 * Brutalist Card Pattern
 */
export const BrutalistCard: Story = {
  render: () => (
    <Box
      as="article"
      style={{
        background: "transparent",
        maxWidth: "400px",
        position: "relative",
      }}
    >
      <Box
        style={{
          padding: "1.5rem",
          fontFamily: "sans-serif",
        }}
      >
        <Box
          style={{
            fontSize: "0.65rem",
            marginBottom: "0.75rem",
            letterSpacing: "0.1em",
            opacity: 0.6,
          }}
        >
          ⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S / 001
        </Box>
        <Headline
          level={3}
          style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}
        >
          🎀 ୧ꔛꗃ˖ PROJECT TITLE ･ﾟ⋆
        </Headline>
        <Paragraph
          style={{
            marginTop: "0.75rem",
            fontSize: "0.875rem",
            opacity: 0.8,
            lineHeight: 1.6,
          }}
        >
          ⋆.˚ ᡣ𐭩 .𖥔˚ Bold design with modern aesthetics. Perfect for portfolio
          items ⋆.˚✮
        </Paragraph>
        <Box
          style={{
            marginTop: "1rem",
            fontSize: "0.75rem",
            opacity: 0.6,
          }}
        >
          ꪻꪖᧁડ: Design ･ Typography ･ Brutalism
        </Box>
      </Box>
    </Box>
  ),
};

/**
 * Grid of Boxes
 */
export const GridOfBoxes: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1rem",
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={i}
          style={{
            background: i % 2 === 0 ? "#171717" : "#f5f5f5",
            color: i % 2 === 0 ? "white" : "black",
            padding: "2rem",
            textAlign: "center",
            border: "2px solid #171717",
          }}
        >
          <Headline
            level={3}
            style={{ color: i % 2 === 0 ? "white" : "black", margin: 0 }}
          >
            Box {i + 1}
          </Headline>
        </Box>
      ))}
    </div>
  ),
};
