import { Box, CustomCursor, DesktopMedia } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";

import { OPTIMIZED_IMAGES } from "../shared/storybook-fixtures";

const IMAGES = [
  {
    id: "landscape",
    name: "Landscape",
    src: OPTIMIZED_IMAGES.landscapePreview,
    kind: "image" as const,
    width: 400,
  },
  {
    id: "still",
    name: "Still 01",
    src: OPTIMIZED_IMAGES.videoStill1Preview,
    kind: "image" as const,
    width: 240,
  },
  {
    id: "store",
    name: "Outlet",
    src: OPTIMIZED_IMAGES.outletStore1,
    kind: "image" as const,
    width: 560,
  },
];

/**
 * Work-page images and native videos as draggable windows, on the same desktop
 * as `DesktopDownloads`. Width comes from the CMS dropdown (240–720px). Video
 * controls never start a drag. Custom cursor becomes 👋 over a window.
 */
const meta = {
  title: "Widgets/DesktopMedia",
  component: DesktopMedia,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DesktopMedia>;

export default meta;
type Story = StoryObj<typeof meta>;

function Stage({ children }: { children: ReactNode }) {
  return (
    <Box
      css={{
        position: "relative",
        width: "100%",
        minH: "100vh",
        backgroundColor: "pageBg",
        overflow: "hidden",
      }}
    >
      <CustomCursor size={18} symbol="✧" />
      {children}
    </Box>
  );
}

export const Images: Story = {
  args: { items: IMAGES },
  render: (args) => (
    <Stage>
      <DesktopMedia {...args} />
    </Stage>
  ),
};

export const WithVideo: Story = {
  args: {
    items: [
      IMAGES[0],
      {
        id: "reel",
        name: "Showreel",
        src: "https://example.com/showreel.mp4",
        kind: "video",
        width: 400,
      },
    ],
  },
  render: (args) => (
    <Stage>
      <DesktopMedia {...args} />
    </Stage>
  ),
};

export const Empty: Story = {
  args: { items: [] },
  render: (args) => (
    <Stage>
      <DesktopMedia {...args} />
    </Stage>
  ),
};
