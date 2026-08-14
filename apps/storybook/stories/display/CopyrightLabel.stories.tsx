import { Box, CopyrightLabel } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const POSITIONS = ["below", "overlay", "inline-black", "inline-white"] as const;

const meta = {
  title: "Display/CopyrightLabel",
  component: CopyrightLabel,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    text: {
      control: "text",
      description: "Credit line; © is prepended unless the string already starts with it",
    },
    source: {
      control: "text",
      description: "Asset source, shown on its own line below the copyright",
    },
    position: {
      control: { type: "select" as const },
      options: POSITIONS,
      table: { defaultValue: { summary: "below" } },
    },
  },
  args: {
    text: "2025 Studio Name",
    source: "",
    position: "below",
  },
} satisfies Meta<typeof CopyrightLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Below: Story = {};

export const WithSource: Story = {
  args: {
    text: "2025 Blender Foundation",
    source: "peach.blender.org",
  },
};

export const Overlay: Story = {
  args: { position: "overlay" },
  render: (args) => (
    <Box css={{ position: "relative", w: "320px", h: "180px", bg: "neutral.700" }}>
      <CopyrightLabel {...args} />
    </Box>
  ),
};

export const InlineWhite: Story = {
  args: { position: "inline-white" },
  render: (args) => (
    <Box css={{ position: "relative", w: "320px", h: "180px", bg: "neutral.800" }}>
      <CopyrightLabel {...args} />
    </Box>
  ),
};

export const InlineBlack: Story = {
  args: { position: "inline-black" },
  render: (args) => (
    <Box css={{ position: "relative", w: "320px", h: "180px", bg: "neutral.200" }}>
      <CopyrightLabel {...args} />
    </Box>
  ),
};

export const SourceOnly: Story = {
  args: { text: "", source: "a.storyblok.com" },
};
