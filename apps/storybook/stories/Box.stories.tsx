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
      control: { type: "select" },
      options: [
        "div",
        "section",
        "article",
        "aside",
        "header",
        "footer",
        "main",
        "nav",
      ],
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
 * Basic Box
 */
export const Basic: Story = {
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
        background: "white",
        border: "4px solid #171717",
        padding: "0",
        maxWidth: "400px",
        boxShadow: "8px 8px 0 #171717",
      }}
    >
      <Box
        style={{
          background: "#171717",
          color: "white",
          padding: "1.5rem",
          borderBottom: "4px solid #171717",
        }}
      >
        <Headline level={3} style={{ color: "white", margin: 0 }}>
          PROJECT TITLE
        </Headline>
      </Box>
      <Box style={{ padding: "1.5rem" }}>
        <Paragraph>
          A brutalist card design with bold borders and strong shadows. Perfect
          for portfolio items.
        </Paragraph>
        <Box
          style={{
            background: "#f5f5f5",
            padding: "0.75rem",
            marginTop: "1rem",
            fontFamily: "monospace",
            fontSize: "0.875rem",
          }}
        >
          Tags: Design, Typography, Brutalism
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
