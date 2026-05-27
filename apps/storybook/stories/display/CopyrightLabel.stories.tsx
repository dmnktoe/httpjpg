import { Box, CopyrightLabel, Image, Stack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { OPTIMIZED_IMAGES } from "../shared/storybook-fixtures";

const POSITION_OPTIONS = ["below", "overlay", "inline-black", "inline-white"] as const;

const meta = {
  title: "Display/CopyrightLabel",
  component: CopyrightLabel,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    text: {
      control: "text",
      description: "Rights-holder text (the © symbol is added automatically).",
    },
    position: {
      control: { type: "select" as const },
      options: POSITION_OPTIONS,
      description:
        "`below` — block flow; `overlay` — bottom gradient strip; `inline-black/white` — vertical sidebar.",
      table: { defaultValue: { summary: "below" } },
    },
  },
} satisfies Meta<typeof CopyrightLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Below: Story = {
  args: {
    text: "Dominik Tobschall",
    position: "below",
  },
};

export const Overlay: Story = {
  args: {
    text: "Dominik Tobschall",
    position: "overlay",
  },
  render: (args) => (
    <Box css={{ position: "relative", width: "400px", aspectRatio: "16/9", overflow: "hidden" }}>
      <Image src={OPTIMIZED_IMAGES.landscape} alt="Sample" />
      <CopyrightLabel {...args} />
    </Box>
  ),
};

export const VerticalSidebar: Story = {
  args: {
    text: "Dominik Tobschall",
    position: "inline-white",
  },
  render: (args) => (
    <Stack direction="horizontal" gap="6">
      <Box css={{ position: "relative", width: "240px", aspectRatio: "4/5", overflow: "hidden" }}>
        <Image src={OPTIMIZED_IMAGES.landscape} alt="Sample" />
        <CopyrightLabel {...args} position="inline-white" />
      </Box>
      <Box
        css={{
          position: "relative",
          width: "240px",
          aspectRatio: "4/5",
          overflow: "hidden",
          bg: "neutral.100",
        }}
      >
        <CopyrightLabel {...args} position="inline-black" />
      </Box>
    </Stack>
  ),
};

export const EmptyText: Story = {
  args: {
    text: "",
    position: "below",
  },
  render: (args) => (
    <Box css={{ border: "1px dashed", borderColor: "neutral.300", p: "4", minH: "60px" }}>
      <CopyrightLabel {...args} />
      <Box css={{ color: "neutral.500", fontSize: "sm" }}>(nothing rendered above)</Box>
    </Box>
  ),
};
