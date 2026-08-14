import { Video } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const NATIVE_SRC =
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4";
const NATIVE_POSTER = "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217";

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
    },
    aspectRatio: {
      control: "select",
      options: ["1/1", "4/3", "16/9", "21/9", "9/16"],
    },
    controls: { control: "boolean" },
    autoPlay: { control: "boolean" },
    loop: { control: "boolean" },
    muted: { control: "boolean" },
    copyrightSource: { control: "text" },
    copyrightPosition: {
      control: "select",
      options: ["inline-white", "inline-black", "below", "overlay"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Video>;

export const YouTube: Story = {
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

export const Native: Story = {
  args: {
    src: NATIVE_SRC,
    source: "native",
    poster: NATIVE_POSTER,
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
  args: {
    src: NATIVE_SRC,
    source: "native",
    poster: NATIVE_POSTER,
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
  args: {
    src: NATIVE_SRC,
    source: "native",
    poster: NATIVE_POSTER,
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
  args: {
    src: NATIVE_SRC,
    source: "native",
    poster: NATIVE_POSTER,
    aspectRatio: "16/9",
    controls: true,
    autoPlay: true,
    loop: true,
    muted: true,
  },
};

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
