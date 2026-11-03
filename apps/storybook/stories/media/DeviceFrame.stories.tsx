import { Box, DEVICE_FRAMES, DeviceFrame, Video } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Media on the screen of a product photo. The device is the frame, the
 * screen quad is clipped and the child is projected into it with a four-point
 * homography. Pair it with `Video` (the `video` blok's Device Frame option).
 */
const meta = {
  title: "Media/DeviceFrame",
  component: DeviceFrame,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    device: {
      control: { type: "select" as const },
      options: Object.keys(DEVICE_FRAMES),
      description: "Preset name, or pass a custom preset object",
    },
    gloss: {
      control: "boolean",
      description: "Keep the photo's screen reflections over the media",
      table: { defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<typeof DeviceFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

const CLIP =
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4";

export const Psp: Story = {
  args: { device: "psp", gloss: true, children: null },
  render: (args) => (
    <Box css={{ maxW: "900px", mx: "auto" }}>
      <DeviceFrame {...args}>
        <Video
          src={CLIP}
          aspectRatio={DEVICE_FRAMES.psp.screenAspect}
          autoPlay
          loop
          muted
          controls={false}
        />
      </DeviceFrame>
    </Box>
  ),
};

export const WithControls: Story = {
  name: "With player controls",
  args: { device: "psp", gloss: true, children: null },
  render: (args) => (
    <Box css={{ maxW: "900px", mx: "auto" }}>
      <DeviceFrame {...args}>
        <Video src={CLIP} aspectRatio={DEVICE_FRAMES.psp.screenAspect} controls />
      </DeviceFrame>
    </Box>
  ),
};
