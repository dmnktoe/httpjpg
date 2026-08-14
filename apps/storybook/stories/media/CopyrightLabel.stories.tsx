import { Box, CopyrightLabel } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Media/CopyrightLabel",
  component: CopyrightLabel,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: { type: "select" as const },
      options: ["below", "overlay", "inline-white", "inline-black"] as const,
    },
  },
  args: {
    text: "2025 httpjpg",
    source: "unsplash.com/@httpjpg",
    position: "below",
  },
} satisfies Meta<typeof CopyrightLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Below: Story = {};

export const Overlay: Story = {
  args: { position: "overlay", source: undefined },
  decorators: [
    (Story) => (
      <Box
        css={{
          position: "relative",
          aspectRatio: "16/9",
          w: "full",
          maxW: "480px",
          bg: "neutral.800",
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

export const InlineWhite: Story = {
  args: { position: "inline-white", source: undefined },
  decorators: [
    (Story) => (
      <Box
        css={{
          position: "relative",
          aspectRatio: "16/9",
          w: "full",
          maxW: "480px",
          bg: "neutral.800",
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

export const InlineBlack: Story = {
  args: { position: "inline-black", source: undefined },
  decorators: [
    (Story) => (
      <Box
        css={{
          position: "relative",
          aspectRatio: "16/9",
          w: "full",
          maxW: "480px",
          bg: "neutral.200",
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

export const SourceOnly: Story = {
  args: { text: undefined, source: "a-storyblok-asset.jpg", position: "below" },
};
