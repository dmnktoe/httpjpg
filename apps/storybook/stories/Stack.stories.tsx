import { Box, Button, Headline, HStack, Paragraph, VStack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import {
  alignArgType,
  justifyArgType,
  spacingArgType,
} from "./storybook-helpers";

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
} satisfies Meta<typeof VStack>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic VStack with live controls
 */
export const Basic: Story = {
  args: {
    gap: "4",
    align: "stretch",
    justify: "start",
    children: null,
  },
  argTypes: {
    gap: spacingArgType("Spacing between items", "4"),
    align: alignArgType("Alignment on cross axis", "stretch"),
    justify: justifyArgType("Justification on main axis", "start"),
  },
  render: (args) => (
    <VStack gap={args.gap} align={args.align} justify={args.justify}>
      <Box css={{ bg: "neutral.100", p: "4", w: "full" }}>Item 1</Box>
      <Box css={{ bg: "neutral.200", p: "4", w: "full" }}>Item 2</Box>
      <Box css={{ bg: "neutral.300", p: "4", w: "full" }}>Item 3</Box>
    </VStack>
  ),
};

/**
 * Interactive Playground - Try different gap, align and justify values!
 */
export const Playground: Story = {
  args: {
    gap: "4",
    align: "stretch",
    justify: "start",
    children: (
      <>
        <Box css={{ bg: "neutral.100", p: "4", w: "full" }}>Item 1</Box>
        <Box css={{ bg: "neutral.200", p: "4", w: "full" }}>Item 2</Box>
        <Box css={{ bg: "neutral.300", p: "4", w: "full" }}>Item 3</Box>
      </>
    ),
  },
  argTypes: {
    gap: spacingArgType("Spacing between items", "4"),
    align: alignArgType("Alignment on cross axis", "stretch"),
    justify: justifyArgType("Justification on main axis", "start"),
  },
};

/**
 * Vertical stack (VStack)
 */
export const Vertical: Story = {
  args: {
    children: null,
  },
  render: () => (
    <VStack gap="4">
      <Box css={{ bg: "neutral.100", p: "4", w: "full" }}>Item 1</Box>
      <Box css={{ bg: "neutral.200", p: "4", w: "full" }}>Item 2</Box>
      <Box css={{ bg: "neutral.300", p: "4", w: "full" }}>Item 3</Box>
    </VStack>
  ),
};

/**
 * Horizontal stack (HStack)
 */
export const Horizontal: Story = {
  args: {
    children: null,
  },
  render: () => (
    <HStack gap="4">
      <Box css={{ bg: "neutral.100", p: "4" }}>Item 1</Box>
      <Box css={{ bg: "neutral.200", p: "4" }}>Item 2</Box>
      <Box css={{ bg: "neutral.300", p: "4" }}>Item 3</Box>
    </HStack>
  ),
};

/**
 * Card layout with VStack
 */
export const CardLayout: Story = {
  args: {
    children: null,
  },
  render: () => (
    <VStack gap="6" css={{ maxW: "400px" }}>
      <Box
        css={{
          bg: "white",
          p: "6",
          border: "1px solid",
          borderColor: "neutral.200",
        }}
      >
        <VStack gap="2">
          <Headline level={3}>Card Title</Headline>
          <Paragraph>Some descriptive text for this card component.</Paragraph>
        </VStack>
      </Box>
      <Box
        css={{
          bg: "white",
          p: "6",
          border: "1px solid",
          borderColor: "neutral.200",
        }}
      >
        <VStack gap="2">
          <Headline level={3}>Another Card</Headline>
          <Paragraph>More content in the second card.</Paragraph>
        </VStack>
      </Box>
    </VStack>
  ),
};

/**
 * Button group with HStack
 */
export const ButtonGroup: Story = {
  args: {
    children: null,
  },
  render: () => (
    <HStack gap="4">
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
  args: {
    children: null,
  },
  render: () => (
    <VStack gap="6" align="center" css={{ p: "12" }}>
      <Headline level={1}>Centered Title</Headline>
      <Box css={{ textAlign: "center", maxW: "600px" }}>
        <Paragraph>
          This content is centered horizontally within the stack. Perfect for
          hero sections and call-to-actions.
        </Paragraph>
      </Box>
      <Button variant="primary">Get Started</Button>
    </VStack>
  ),
};

/**
 * Space between items
 */
export const SpaceBetween: Story = {
  args: {
    children: null,
  },
  render: () => (
    <HStack
      fullWidth
      css={{ p: "4", bg: "neutral.100", justifyContent: "space-between" }}
    >
      <Headline level={3}>Logo</Headline>
      <HStack gap="4">
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
  args: {
    children: null,
  },
  render: () => (
    <VStack gap="8">
      <VStack gap="2">
        <Box css={{ fontWeight: "600" }}>
          <Paragraph>Gap 0:</Paragraph>
        </Box>
        <VStack gap="0">
          <Box css={{ bg: "neutral.100", p: "2" }}>Item 1</Box>
          <Box css={{ bg: "neutral.200", p: "2" }}>Item 2</Box>
        </VStack>
      </VStack>

      <VStack gap="2">
        <Box css={{ fontWeight: "600" }}>
          <Paragraph>Gap 2:</Paragraph>
        </Box>
        <VStack gap="2">
          <Box css={{ bg: "neutral.100", p: "2" }}>Item 1</Box>
          <Box css={{ bg: "neutral.200", p: "2" }}>Item 2</Box>
        </VStack>
      </VStack>

      <VStack gap="2">
        <Box css={{ fontWeight: "600" }}>
          <Paragraph>Gap 8:</Paragraph>
        </Box>
        <VStack gap="8">
          <Box css={{ bg: "neutral.100", p: "2" }}>Item 1</Box>
          <Box css={{ bg: "neutral.200", p: "2" }}>Item 2</Box>
        </VStack>
      </VStack>
    </VStack>
  ),
};
