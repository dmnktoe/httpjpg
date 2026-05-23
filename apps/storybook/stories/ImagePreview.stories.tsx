import { Box, ImagePreview, Stack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
  "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=600",
];

const meta = {
  title: "UI/ImagePreview",
  component: ImagePreview,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    width: {
      control: { type: "number" },
      description: "Preview width in px (height is derived 16:9).",
      table: { defaultValue: { summary: "100" } },
    },
    offset: {
      control: "object",
      description: "Pixel offset from the cursor.",
      table: { defaultValue: { summary: "{ x: 5, y: 5 }" } },
    },
  },
} satisfies Meta<typeof ImagePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HoverTargets: Story = {
  args: {
    width: 160,
    offset: { x: 16, y: 16 },
  },
  render: (args) => (
    <Box css={{ p: "8", minH: "60vh" }}>
      <ImagePreview {...args} />
      <Stack gap="3">
        <Box css={{ fontSize: "sm", color: "neutral.600" }}>
          Hover any link below — the preview follows your cursor.
        </Box>
        {SAMPLE_IMAGES.map((src, idx) => (
          <Box
            key={src}
            data-preview-image={src}
            css={{
              display: "inline-block",
              fontFamily: "mono",
              cursor: "pointer",
              borderBottom: "1px solid",
              borderColor: "neutral.400",
              py: "1",
              w: "fit-content",
              _hover: { borderColor: "neutral.900" },
            }}
          >
            Project #{idx + 1} — hover me
          </Box>
        ))}
      </Stack>
    </Box>
  ),
};

export const LargePreview: Story = {
  args: {
    width: 280,
    offset: { x: 24, y: 24 },
  },
  render: (args) => (
    <Box css={{ p: "8", minH: "60vh" }}>
      <ImagePreview {...args} />
      <Box
        data-preview-image={SAMPLE_IMAGES[0]}
        css={{
          display: "inline-block",
          fontFamily: "mono",
          fontSize: "2xl",
          cursor: "pointer",
          py: "2",
        }}
      >
        ↗ Hover here for a bigger preview
      </Box>
    </Box>
  ),
};

export const Mixed: Story = {
  args: {
    width: 180,
  },
  render: (args) => (
    <Box css={{ p: "8", minH: "60vh" }}>
      <ImagePreview {...args} />
      <Stack gap="2">
        <Box css={{ fontSize: "sm", color: "neutral.600" }}>
          Only the rows with `data-preview-image` will trigger a preview.
        </Box>
        <Box css={{ fontFamily: "mono", color: "neutral.500", py: "1" }}>
          Plain text — no preview
        </Box>
        <Box
          data-preview-image={SAMPLE_IMAGES[1]}
          css={{ fontFamily: "mono", cursor: "pointer", py: "1" }}
        >
          Subscribed row — has preview
        </Box>
        <Box css={{ fontFamily: "mono", color: "neutral.500", py: "1" }}>Another plain row</Box>
        <Box
          data-preview-image={SAMPLE_IMAGES[2]}
          css={{ fontFamily: "mono", cursor: "pointer", py: "1" }}
        >
          Subscribed row — has preview
        </Box>
      </Stack>
    </Box>
  ),
};
