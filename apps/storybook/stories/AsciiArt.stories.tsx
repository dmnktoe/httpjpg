import { AsciiArt, Box, Stack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const SAMPLE_BANNER = String.raw`
  ___ _____ _____ ___    _ ___ ___
 | __|_   _|_   _| _ \  | | _ \ __|
 | _|  | |   | | |  _/ |_| |  _/ _|
 |_|   |_|   |_| |_|   |__/|_| |___|
`;

const SMALLER_BANNER = String.raw`
   * * *
  *  *  *
   * * *
`;

const meta = {
  title: "Layout/AsciiArt",
  component: AsciiArt,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description:
        "Optional accessible label (sets role='img'). When empty the art is aria-hidden.",
    },
    inline: {
      control: "boolean",
      description: "Render inline instead of as a centered block.",
    },
    children: {
      control: "text",
      description: "Raw ASCII content; whitespace is preserved.",
    },
  },
} satisfies Meta<typeof AsciiArt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: SAMPLE_BANNER,
    label: "HTTPJPG banner",
    inline: false,
  },
};

export const Block: Story = {
  args: {
    children: SAMPLE_BANNER,
  },
  render: (args) => (
    <Box css={{ border: "1px dashed", borderColor: "neutral.300", p: "4" }}>
      <AsciiArt {...args} />
    </Box>
  ),
};

export const Inline: Story = {
  args: {
    children: SMALLER_BANNER,
    inline: true,
  },
  render: (args) => (
    <Stack direction="horizontal" gap="6" align="center">
      <AsciiArt {...args} />
      <Box>Sits next to whatever you place beside it.</Box>
      <AsciiArt {...args} />
    </Stack>
  ),
};

export const Variants: Story = {
  args: {
    children: SAMPLE_BANNER,
  },
  render: () => (
    <Stack gap="8">
      <AsciiArt label="Big banner">{SAMPLE_BANNER}</AsciiArt>
      <AsciiArt label="Sparkle row">{SMALLER_BANNER}</AsciiArt>
    </Stack>
  ),
};
