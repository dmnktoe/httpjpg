import { Box, Button, Headline, HStack, Paragraph, VStack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Stack component stories
 *
 * Flexible layout components for vertical (VStack) and horizontal (HStack) layouts.
 */
const meta = {
  title: "Layout/Stack",
  component: VStack,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    gap: {
      control: { type: "select" },
      options: [0, 1, 2, 4, 6, 8, 12, 16],
      description: "Spacing between items",
      table: {
        defaultValue: { summary: "4" },
      },
    },
    align: {
      control: { type: "select" },
      options: ["start", "center", "end", "stretch", "baseline"],
      description: "Alignment on cross axis",
      table: {
        defaultValue: { summary: "stretch" },
      },
    },
    justify: {
      control: { type: "select" },
      options: [
        "start",
        "center",
        "end",
        "space-between",
        "space-around",
        "space-evenly",
      ],
      description: "Justification on main axis",
      table: {
        defaultValue: { summary: "start" },
      },
    },
  },
} satisfies Meta<typeof VStack>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Vertical stack (VStack)
 */
export const Vertical: Story = {
  render: () => (
    <VStack gap={4}>
      <Box style={{ background: "#f5f5f5", padding: "1rem", width: "100%" }}>
        Item 1
      </Box>
      <Box style={{ background: "#e5e5e5", padding: "1rem", width: "100%" }}>
        Item 2
      </Box>
      <Box style={{ background: "#d4d4d4", padding: "1rem", width: "100%" }}>
        Item 3
      </Box>
    </VStack>
  ),
};

/**
 * Horizontal stack (HStack)
 */
export const Horizontal: Story = {
  render: () => (
    <HStack gap={4}>
      <Box style={{ background: "#f5f5f5", padding: "1rem" }}>Item 1</Box>
      <Box style={{ background: "#e5e5e5", padding: "1rem" }}>Item 2</Box>
      <Box style={{ background: "#d4d4d4", padding: "1rem" }}>Item 3</Box>
    </HStack>
  ),
};

/**
 * Card layout with VStack
 */
export const CardLayout: Story = {
  render: () => (
    <VStack gap={6} style={{ maxWidth: "400px" }}>
      <Box
        style={{
          background: "white",
          padding: "1.5rem",
          border: "1px solid #e5e5e5",
        }}
      >
        <Headline level={3}>Card Title</Headline>
        <Paragraph style={{ marginTop: "0.5rem" }}>
          Some descriptive text for this card component.
        </Paragraph>
      </Box>
      <Box
        style={{
          background: "white",
          padding: "1.5rem",
          border: "1px solid #e5e5e5",
        }}
      >
        <Headline level={3}>Another Card</Headline>
        <Paragraph style={{ marginTop: "0.5rem" }}>
          More content in the second card.
        </Paragraph>
      </Box>
    </VStack>
  ),
};

/**
 * Button group with HStack
 */
export const ButtonGroup: Story = {
  render: () => (
    <HStack gap={4}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
    </HStack>
  ),
};

/**
 * Centered content
 */
export const Centered: Story = {
  render: () => (
    <VStack gap={6} align="center" style={{ padding: "3rem" }}>
      <Headline level={1}>Centered Title</Headline>
      <Paragraph style={{ textAlign: "center", maxWidth: "600px" }}>
        This content is centered horizontally within the stack. Perfect for hero
        sections and call-to-actions.
      </Paragraph>
      <Button variant="primary">Get Started</Button>
    </VStack>
  ),
};

/**
 * Space between items
 */
export const SpaceBetween: Story = {
  render: () => (
    <HStack
      justify="space-between"
      style={{ padding: "1rem", background: "#f5f5f5" }}
    >
      <Headline level={3}>Logo</Headline>
      <HStack gap={4}>
        <Button variant="outline" size="sm">
          Login
        </Button>
        <Button variant="primary" size="sm">
          Sign Up
        </Button>
      </HStack>
    </HStack>
  ),
};

/**
 * Different gap sizes
 */
export const GapSizes: Story = {
  render: () => (
    <VStack gap={8}>
      <div>
        <Paragraph style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
          Gap 0:
        </Paragraph>
        <VStack gap={0}>
          <div style={{ background: "#f5f5f5", padding: "0.5rem" }}>Item 1</div>
          <div style={{ background: "#e5e5e5", padding: "0.5rem" }}>Item 2</div>
        </VStack>
      </div>

      <div>
        <Paragraph style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
          Gap 2:
        </Paragraph>
        <VStack gap={2}>
          <div style={{ background: "#f5f5f5", padding: "0.5rem" }}>Item 1</div>
          <div style={{ background: "#e5e5e5", padding: "0.5rem" }}>Item 2</div>
        </VStack>
      </div>

      <div>
        <Paragraph style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
          Gap 8:
        </Paragraph>
        <VStack gap={8}>
          <div style={{ background: "#f5f5f5", padding: "0.5rem" }}>Item 1</div>
          <div style={{ background: "#e5e5e5", padding: "0.5rem" }}>Item 2</div>
        </VStack>
      </div>
    </VStack>
  ),
};
