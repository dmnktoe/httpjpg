import { Box, Lightbox, type LightboxItem, LightboxTrigger, useLightbox } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { OPTIMIZED_IMAGES } from "../shared/storybook-fixtures";

const ITEMS: LightboxItem[] = [
  {
    src: OPTIMIZED_IMAGES.landscape,
    alt: "Klosterkirche Nordshausen, wide",
    caption: "Time this wild beast in the jungle",
    copyright: "2025 httpjpg",
  },
  {
    src: OPTIMIZED_IMAGES.portrait,
    alt: "Klosterkirche Nordshausen, tall",
    caption: "The same nave, turned upright",
    copyright: "2025 httpjpg",
  },
  { src: OPTIMIZED_IMAGES.videoStill1, alt: "Video still 1" },
  {
    src: OPTIMIZED_IMAGES.videoStill2,
    alt: "Video still 2",
    copyright: "2025 Studio Name",
  },
];

const meta = {
  title: "Media/Lightbox",
  component: Lightbox,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: {
    open: true,
    items: ITEMS,
    index: 0,
    onClose: () => {},
    onIndexChange: () => {},
  },
  argTypes: {
    open: { control: "boolean" },
    index: { control: { type: "number" as const, min: 0, max: ITEMS.length - 1 } },
    theme: {
      control: { type: "inline-radio" as const },
      options: [undefined, "light", "dark"],
      description: "Pins the theme instead of mirroring the page's `data-theme`.",
    },
  },
} satisfies Meta<typeof Lightbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Portrait: Story = {
  args: { index: 1 },
};

export const WithoutCaption: Story = {
  args: { index: 2 },
};

export const SingleImage: Story = {
  args: { items: [ITEMS[0]!] },
};

export const Dark: Story = {
  args: { theme: "dark" },
};

export const WithVideo: Story = {
  args: {
    items: [
      {
        src: "https://www.w3schools.com/html/mov_bbb.mp4",
        alt: "Big Buck Bunny",
        caption: "A native file, played in place",
        copyright: "2025 Blender Foundation",
        video: { source: "native" },
      },
    ],
  },
};

export const FromAThumbnail: Story = {
  args: { open: false },
  render: () => {
    const Gallery = () => {
      const viewer = useLightbox();

      return (
        <Box css={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2", p: "4" }}>
          {ITEMS.map((item, index) => (
            <Box key={item.src} css={{ position: "relative", aspectRatio: "4/3" }}>
              <img
                src={item.src}
                alt={item.alt}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <LightboxTrigger
                label={`Open ${item.alt} at full size`}
                onClick={() => viewer.openAt(index)}
              />
            </Box>
          ))}
          <Lightbox
            open={viewer.open}
            items={ITEMS}
            index={viewer.index}
            onClose={viewer.close}
            onIndexChange={viewer.setIndex}
          />
        </Box>
      );
    };

    return <Gallery />;
  },
};
