import { Box, CustomCursor, DesktopDownloads } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";

const ITEMS = [
  { id: "press", name: "Press kit.pdf", url: "https://example.com/press.pdf" },
  { id: "source", name: "Source.zip", url: "https://example.com/source.zip" },
  { id: "poster", name: "Poster.png", url: "https://example.com/poster.png" },
  { id: "reel", name: "Showreel.mp4", url: "https://example.com/reel.mp4" },
  { id: "loop", name: "Loop.mp3", url: "https://example.com/loop.mp3" },
  { id: "brief", name: "Brief.docx", url: "https://example.com/brief.docx" },
];

/**
 * Work-page downloads as Windows XP desktop icons. Drag to move; double-click
 * to download. Hover uses the same 👋 cursor as Now Playing.
 */
const meta = {
  title: "Widgets/DesktopDownloads",
  component: DesktopDownloads,
  parameters: {
    layout: "fullscreen",
    argos: { fitToContent: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DesktopDownloads>;

export default meta;
type Story = StoryObj<typeof meta>;

function XpStage({ children }: { children: ReactNode }) {
  return (
    <Box
      css={{
        position: "relative",
        width: "100%",
        minH: "100vh",
        backgroundColor: "#245EDC",
        overflow: "hidden",
      }}
    >
      {children}
      <CustomCursor size={18} symbol="✧" />
    </Box>
  );
}

export const WindowsXpDesktop: Story = {
  args: { items: ITEMS },
  render: (args) => (
    <XpStage>
      <DesktopDownloads {...args} />
    </XpStage>
  ),
};

export const SingleFile: Story = {
  args: { items: [ITEMS[0]] },
  render: (args) => (
    <XpStage>
      <DesktopDownloads {...args} />
    </XpStage>
  ),
};

export const Empty: Story = {
  args: { items: [] },
  render: (args) => (
    <XpStage>
      <DesktopDownloads {...args} />
    </XpStage>
  ),
};
