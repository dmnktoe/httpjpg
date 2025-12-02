import { video } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof video> = {
  title: "Components/Video",
  component: video,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    source: {
      control: "select",
      options: ["native", "youtube", "vimeo"],
      description: "Video source type",
    },
    aspectRatio: {
      control: "select",
      options: ["1/1", "4/3", "16/9", "21/9", "9/16"],
      description: "Video aspect ratio (or custom number)",
    },
    controls: {
      control: "boolean",
      description: "Show video controls",
    },
    autoPlay: {
      control: "boolean",
      description: "Autoplay video",
    },
    loop: {
      control: "boolean",
      description: "Loop video",
    },
    muted: {
      control: "boolean",
      description: "Mute video",
    },
    copyrightPosition: {
      control: "select",
      options: ["below", "overlay"],
      description: "Copyright text position",
    },
  },
};

export default meta;
type Story = StoryObj<typeof video>;

/**
 * YouTube video embed
 */
export const YouTube: Story = {
  args: {
    src: "dQw4w9WgXcQ",
    source: "youtube",
    aspectRatio: "16/9",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
    copyright: "© 2025 YouTube Video",
    copyrightPosition: "below",
  },
};

/**
 * Vimeo video embed
 */
export const Vimeo: Story = {
  args: {
    src: "76979871",
    source: "vimeo",
    aspectRatio: "16/9",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
    copyright: "© 2025 Vimeo Video",
    copyrightPosition: "below",
  },
};

/**
 * Native video with custom controls
 */
export const Native: Story = {
  args: {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    source: "native",
    poster:
      "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217",
    aspectRatio: "16/9",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
    copyright: "© 2008 Blender Foundation | www.bigbuckbunny.org",
    copyrightPosition: "below",
  },
};

/**
 * Native video with overlay copyright
 */
export const NativeWithOverlayCopyright: Story = {
  args: {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    source: "native",
    poster:
      "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217",
    aspectRatio: "16/9",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
    copyright: "© 2008 Blender Foundation",
    copyrightPosition: "overlay",
  },
};

/**
 * Square aspect ratio (1:1)
 */
export const SquareAspectRatio: Story = {
  args: {
    src: "dQw4w9WgXcQ",
    source: "youtube",
    aspectRatio: "1/1",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
  },
};

/**
 * Ultrawide aspect ratio (21:9)
 */
export const UltrawideAspectRatio: Story = {
  args: {
    src: "dQw4w9WgXcQ",
    source: "youtube",
    aspectRatio: "21/9",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
  },
};

/**
 * Autoplay and muted (recommended for autoplay)
 */
export const AutoplayMuted: Story = {
  args: {
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    source: "native",
    poster:
      "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217",
    aspectRatio: "16/9",
    controls: true,
    autoPlay: true,
    loop: true,
    muted: true,
  },
};

/**
 * Without controls
 */
export const WithoutControls: Story = {
  args: {
    src: "dQw4w9WgXcQ",
    source: "youtube",
    aspectRatio: "16/9",
    controls: false,
    autoPlay: false,
    loop: false,
    muted: false,
  },
};
