import { MiniPlayer } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof MiniPlayer> = {
  title: "Widgets/MiniPlayer",
  component: MiniPlayer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text", description: "Track title" },
    artist: { control: "text", description: "Artist name" },
    artwork: { control: "text", description: "Artwork URL shown on the spinning record" },
    href: { control: "text", description: "Page the record links back to" },
    currentTime: { control: "number", description: "Elapsed seconds" },
    duration: { control: "number", description: "Track length in seconds; 0 renders -:--" },
    isPlaying: { control: "boolean", description: "Spins the record and flips the play control" },
    hasNext: { control: "boolean", description: "Enables the next control" },
    hasPrevious: { control: "boolean", description: "Enables the previous control" },
  },
  args: {
    title: "Night Drive",
    artist: "Nova",
    isPlaying: true,
    currentTime: 65,
    duration: 185,
    hasNext: true,
    hasPrevious: true,
  },
};

export default meta;
type Story = StoryObj<typeof MiniPlayer>;

/**
 * The page-wide player as it sits in the header, right behind the ⌘+K trigger.
 * On the site it is wired to `AudioPlayerProvider`; here it is fully controlled.
 */
export const Playing: Story = {};

/**
 * Paused: the record holds still and the control offers play again.
 */
export const Paused: Story = {
  args: { isPlaying: false },
};

/**
 * Before the metadata lands there is no clock to show yet.
 */
export const UnknownLength: Story = {
  args: { currentTime: 0, duration: 0 },
};

/**
 * A single track on the page — both ends of the queue are disabled.
 */
export const SingleTrack: Story = {
  args: { hasNext: false, hasPrevious: false },
};

/**
 * With artwork the 16px record shows the cover instead of the glyph.
 */
export const WithArtwork: Story = {
  args: {
    href: "/work/night-drive",
    artwork:
      "https://a.storyblok.com/f/292817/1000x1000/0f2e0b0c8a/placeholder.jpg/m/64x64/filters:format(webp)",
  },
};

/**
 * How it reads inside a line of header copy.
 */
export const InHeaderCopy: Story = {
  render: (args) => (
    <span style={{ fontFamily: "monospace", fontSize: 12 }}>
      ꫝꪊꫝꪊꪊꪊ ꫝꪻꪻρ &&& ꠹ρᧁ! 🎀 • ⌘+𝙆 • <MiniPlayer {...args} />
    </span>
  ),
};
