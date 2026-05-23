import { Box, ImagePreview, Stack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { OPTIMIZED_IMAGES } from "../shared/storybook-fixtures";

const meta = {
  title: "Display/ImagePreview",
  component: ImagePreview,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    width: {
      control: { type: "range", min: 60, max: 320, step: 10 },
      description: "Preview width in px (height auto-derived 16/9)",
      table: { defaultValue: { summary: "100" } },
    },
    offset: {
      control: "object",
      description: "Cursor offset { x, y } in px",
      table: { defaultValue: { summary: "{ x: 5, y: 5 }" } },
    },
  },
} satisfies Meta<typeof ImagePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    width: 160,
    offset: { x: 20, y: 20 },
  },
  render: (args) => (
    <Box css={{ p: 8, maxW: "720px", mx: "auto" }}>
      <Stack direction="vertical" gap="3">
        <Box
          as="span"
          data-preview-image={OPTIMIZED_IMAGES.videoStill1Preview}
          css={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Project Alpha — video still 1
        </Box>
        <Box
          as="span"
          data-preview-image={OPTIMIZED_IMAGES.videoStill2Preview}
          css={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Project Beta — video still 2
        </Box>
        <Box
          as="span"
          data-preview-image={OPTIMIZED_IMAGES.videoStill3Preview}
          css={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Project Gamma — video still 3
        </Box>
        <Box
          as="span"
          data-preview-image={OPTIMIZED_IMAGES.landscapePreview}
          css={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Klosterkirche Nordshausen — landscape
        </Box>
      </Stack>
      <ImagePreview {...args} />
    </Box>
  ),
};

export const LargePreview: Story = {
  args: {
    width: 280,
    offset: { x: 24, y: 24 },
  },
  render: (args) => (
    <Box css={{ p: 8, maxW: "720px", mx: "auto" }}>
      <Stack direction="vertical" gap="3">
        <Box
          as="span"
          data-preview-image={OPTIMIZED_IMAGES.videoStill1Preview}
          css={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Hover for large preview 1
        </Box>
        <Box
          as="span"
          data-preview-image={OPTIMIZED_IMAGES.videoStill2Preview}
          css={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Hover for large preview 2
        </Box>
      </Stack>
      <ImagePreview {...args} />
    </Box>
  ),
};
