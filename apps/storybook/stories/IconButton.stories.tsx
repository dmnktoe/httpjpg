import { Box, IconButton, Stack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const ICON_OPTIONS = [
  "arrow-up",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "play",
  "pause",
  "volume",
  "volume-mute",
] as const;

const SIZE_OPTIONS = ["sm", "md", "lg"] as const;
const VARIANT_OPTIONS = ["default", "slideshow", "ghost"] as const;

const meta = {
  title: "UI/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: { type: "select" as const },
      options: ICON_OPTIONS,
      description: "Icon glyph rendered inside the button.",
    },
    variant: {
      control: { type: "select" as const },
      options: VARIANT_OPTIONS,
      description: "Visual treatment. `slideshow` is dimmed-on-light-images.",
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: { type: "select" as const },
      options: SIZE_OPTIONS,
      table: { defaultValue: { summary: "md" } },
    },
    iconSize: {
      control: "text",
      description: "CSS length passed straight to the inner Icon.",
      table: { defaultValue: { summary: "24px" } },
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    icon: "play",
    variant: "default",
    size: "md",
    "aria-label": "Play",
  },
};

export const Variants: Story = {
  args: {
    icon: "play",
    "aria-label": "Play",
  },
  render: (args) => (
    <Stack direction="horizontal" gap="6" align="center">
      {VARIANT_OPTIONS.map((variant) => (
        <Stack key={variant} gap="2" align="center">
          <IconButton {...args} variant={variant} />
          <Box css={{ fontFamily: "mono", fontSize: "xs", color: "neutral.600" }}>{variant}</Box>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  args: {
    icon: "pause",
    "aria-label": "Pause",
  },
  render: (args) => (
    <Stack direction="horizontal" gap="6" align="center">
      {SIZE_OPTIONS.map((size) => (
        <Stack key={size} gap="2" align="center">
          <IconButton {...args} size={size} />
          <Box css={{ fontFamily: "mono", fontSize: "xs", color: "neutral.600" }}>{size}</Box>
        </Stack>
      ))}
    </Stack>
  ),
};

export const OnMedia: Story = {
  args: {
    icon: "arrow-right",
    variant: "slideshow",
    "aria-label": "Next slide",
  },
  render: (args) => (
    <Box
      css={{
        position: "relative",
        width: "400px",
        aspectRatio: "16/9",
        bg: "neutral.900",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: "3",
      }}
    >
      <IconButton {...args} icon="arrow-left" aria-label="Previous slide" />
      <IconButton {...args} icon="arrow-right" aria-label="Next slide" />
    </Box>
  ),
};

export const Disabled: Story = {
  args: {
    icon: "volume",
    disabled: true,
    "aria-label": "Volume (disabled)",
  },
};
