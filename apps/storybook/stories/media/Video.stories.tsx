import { Video } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { OPTIMIZED_IMAGES } from "../shared/storybook-fixtures";

const meta: Meta<typeof Video> = {
  title: "Media/Video",
  component: Video,
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
      description:
        "Fixed box. Omit on native to use the file's intrinsic size, or mediaWidth/mediaHeight.",
    },
    mediaWidth: {
      control: "number",
      description: "CMS asset width in px; used when aspectRatio is unset",
    },
    mediaHeight: {
      control: "number",
      description: "CMS asset height in px; used when aspectRatio is unset",
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
    poster: {
      control: "text",
      description:
        "Still shown until native playback starts (overlay — the browser drops the native poster)",
    },
    objectFit: {
      control: "select",
      options: ["contain", "cover", "fill", "none", "scale-down"],
      description: "How the native video fills a fixed aspect box",
    },
    copyrightSource: {
      control: "text",
      description: "Asset source/credit, shown as a second line below the copyright",
    },
    copyrightPosition: {
      control: "select",
      options: ["below", "overlay", "inline-black", "inline-white"],
      description: "Copyright text position",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Video>;

export const YouTube: Story = {
  tags: ["!test"],
  args: {
    src: "dQw4w9WgXcQ",
    source: "youtube",
    aspectRatio: "16/9",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
    copyright: "2025 YouTube Video",
    copyrightPosition: "below",
  },
};

export const Vimeo: Story = {
  tags: ["!test"],
  args: {
    src: "76979871",
    source: "vimeo",
    aspectRatio: "16/9",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
    copyright: "2025 Vimeo Video",
    copyrightPosition: "below",
  },
};

/**
 * Native file without `aspectRatio` — height follows the media, not a fixed box.
 */
export const NativeIntrinsic: Story = {
  tags: ["!test"],
  args: {
    src: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4",
    source: "native",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
  },
};

export const Native: Story = {
  tags: ["!test"],
  args: {
    src: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4",
    source: "native",
    poster: OPTIMIZED_IMAGES.videoStill1Preview,
    aspectRatio: "16/9",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
    copyright: "2008 Blender Foundation | www.bigbuckbunny.org",
    copyrightPosition: "below",
  },
};

export const NativeWithCopyrightSource: Story = {
  tags: ["!test"],
  args: {
    src: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4",
    source: "native",
    poster: OPTIMIZED_IMAGES.videoStill1Preview,
    aspectRatio: "16/9",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
    copyright: "2008 Blender Foundation",
    copyrightSource: "peach.blender.org",
    copyrightPosition: "below",
  },
};

export const NativeWithOverlayCopyright: Story = {
  tags: ["!test"],
  args: {
    src: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4",
    source: "native",
    poster: OPTIMIZED_IMAGES.videoStill1Preview,
    aspectRatio: "16/9",
    controls: true,
    autoPlay: false,
    loop: false,
    muted: false,
    copyright: "2008 Blender Foundation",
    copyrightPosition: "overlay",
  },
};

export const SquareAspectRatio: Story = {
  tags: ["!test"],
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

export const UltrawideAspectRatio: Story = {
  tags: ["!test"],
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

export const AutoplayMuted: Story = {
  tags: ["!test"],
  args: {
    src: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4",
    source: "native",
    poster: OPTIMIZED_IMAGES.videoStill1Preview,
    aspectRatio: "16/9",
    controls: true,
    autoPlay: true,
    loop: true,
    muted: true,
  },
};

export const WithoutControls: Story = {
  tags: ["!test"],
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
