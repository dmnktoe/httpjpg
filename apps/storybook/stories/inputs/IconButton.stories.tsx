import { Box, IconButton, Stack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Inputs/IconButton",
  component: IconButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: "select",
      options: [
        "arrow-up",
        "arrow-down",
        "arrow-left",
        "arrow-right",
        "play",
        "pause",
        "volume",
        "volume-mute",
      ],
      description: "Icon glyph from the bundled icon set",
    },
    variant: {
      control: { type: "inline-radio" },
      options: ["default", "slideshow", "ghost"] as const,
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: { type: "inline-radio" },
      options: ["sm", "md", "lg"] as const,
      table: { defaultValue: { summary: "md" } },
    },
    iconSize: {
      control: "text",
      table: { defaultValue: { summary: "24px" } },
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    icon: "arrow-right",
    "aria-label": "Next slide",
    variant: "default",
    size: "md",
  },
};

export const Variants: Story = {
  args: { icon: "play", "aria-label": "Play" },
  render: () => (
    <Stack direction="horizontal" gap="6" align="center">
      <Box css={{ p: "3", bg: "neutral.50", borderRadius: "md" }}>
        <IconButton icon="play" aria-label="Play (default)" variant="default" />
      </Box>
      <Box css={{ p: "3", bg: "black", borderRadius: "md" }}>
        <IconButton icon="play" aria-label="Play (slideshow)" variant="slideshow" />
      </Box>
      <Box css={{ p: "3", bg: "neutral.50", borderRadius: "md" }}>
        <IconButton icon="play" aria-label="Play (ghost)" variant="ghost" />
      </Box>
    </Stack>
  ),
};

export const Sizes: Story = {
  args: { icon: "arrow-right", "aria-label": "Next" },
  render: () => (
    <Stack direction="horizontal" gap="4" align="center">
      <IconButton icon="arrow-right" aria-label="Next (sm)" size="sm" />
      <IconButton icon="arrow-right" aria-label="Next (md)" size="md" />
      <IconButton icon="arrow-right" aria-label="Next (lg)" size="lg" />
    </Stack>
  ),
};

export const CustomIconSize: Story = {
  args: {
    icon: "volume",
    "aria-label": "Volume",
    iconSize: "40px",
    variant: "ghost",
  },
};
