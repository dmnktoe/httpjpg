import { Box, Headline, Paragraph, ScrollPinImage, Stack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { OPTIMIZED_IMAGES } from "./storybook-fixtures";

const meta = {
  title: "Components/ScrollPinImage",
  component: ScrollPinImage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    pinDistance: {
      control: "text",
      description: "CSS length controlling how long the pin lasts (e.g. 100vh, 200vh).",
    },
    maxClipRatio: {
      control: { type: "range", min: 0, max: 30, step: 0.5 },
    },
    maxScale: {
      control: { type: "range", min: 1, max: 1.6, step: 0.01 },
    },
    brackets: { control: "boolean" },
    showProgress: { control: "boolean" },
    aspectRatio: { control: "text" },
  },
} satisfies Meta<typeof ScrollPinImage>;

export default meta;
type Story = StoryObj<typeof meta>;

const Spacer = ({ label }: { label: string }) => (
  <Box
    css={{
      height: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "mono",
      fontSize: "sm",
      opacity: 0.4,
      borderTop: "1px dashed",
      borderColor: "neutral.300",
      _pageDark: { borderColor: "neutral.700" },
    }}
  >
    ↓ {label} — keep scrolling ↓
  </Box>
);

export const Default: Story = {
  args: {
    src: OPTIMIZED_IMAGES.landscape,
    alt: "Klosterkirche Nordshausen",
    aspectRatio: "16/9",
    pinDistance: "100vh",
    maxClipRatio: 12,
    maxScale: 1.15,
    brackets: true,
    showProgress: true,
  },
  render: (args) => (
    <Stack direction="vertical" gap="0" css={{ maxWidth: "1200px", mx: "auto", px: 6 }}>
      <Spacer label="scroll toward the pin" />
      <Box css={{ py: 8 }}>
        <Headline as="h2" css={{ mb: 4 }}>
          [ pinned reveal ]
        </Headline>
        <Paragraph css={{ mb: 6, opacity: 0.7 }}>
          The image sticks at viewport center and the mask retreats from {args.maxClipRatio}% to 0
          over {args.pinDistance} of scroll. ASCII corner brackets and a progress label ride along.
        </Paragraph>
      </Box>
      <ScrollPinImage {...args} />
      <Spacer label="released — keep going" />
    </Stack>
  ),
};

export const LongPin: Story = {
  args: {
    src: OPTIMIZED_IMAGES.videoStill1,
    alt: "Video still",
    aspectRatio: "21/9",
    pinDistance: "200vh",
    maxClipRatio: 18,
    maxScale: 1.2,
    brackets: true,
    showProgress: true,
  },
  render: (args) => (
    <Stack direction="vertical" gap="0">
      <Spacer label="long pin coming up (200vh travel)" />
      <ScrollPinImage {...args} />
      <Spacer label="end" />
    </Stack>
  ),
};

export const Minimal: Story = {
  args: {
    src: OPTIMIZED_IMAGES.videoStill3,
    alt: "Video still",
    aspectRatio: "16/9",
    pinDistance: "80vh",
    maxClipRatio: 8,
    maxScale: 1.08,
    brackets: false,
    showProgress: false,
  },
  render: (args) => (
    <Stack direction="vertical" gap="0">
      <Spacer label="minimal — no ascii furniture" />
      <ScrollPinImage {...args} />
      <Spacer label="end" />
    </Stack>
  ),
};
