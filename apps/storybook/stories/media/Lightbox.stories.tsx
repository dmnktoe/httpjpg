import { Box, Lightbox, type LightboxItem, LightboxTrigger, useLightbox } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { OPTIMIZED_IMAGES } from "../shared/storybook-fixtures";

const ITEMS: LightboxItem[] = [
  {
    src: OPTIMIZED_IMAGES.landscape,
    alt: "Klosterkirche Nordshausen, wide",
    caption: "Time this wild beast in the jungle",
    copyright: "2025 httpjpg",
    copyrightSource: "id-100.online",
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
  // Controlled and presentational, same split as CommandPalette / AskWidget:
  // these no-ops are enough for the static stories, and FromAThumbnail wires
  // real state so navigation can actually be tried.
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

/** Caption on the left, credit on the right, counter and controls up top. */
export const Default: Story = {};

/** A tall image is bounded by height rather than width and stays uncropped. */
export const Portrait: Story = {
  args: { index: 1 },
};

/** No caption and no credit collapses the bottom bar rather than leaving a gap. */
export const WithoutCaption: Story = {
  args: { index: 2 },
};

/** A single item drops prev/next and the counter reads `[ 01 ]`. */
export const SingleImage: Story = {
  args: { items: [ITEMS[0]!] },
};

/**
 * The frame takes its colours from `pageBg` / `pageFg` / `pageBorder`, so it
 * follows the page. Portalled overlays land outside the element carrying
 * `data-theme`, which is why the lightbox restates it on its own portal root —
 * this story pins the value to show the dark end of that.
 */
export const Dark: Story = {
  args: { theme: "dark" },
};

/**
 * A `video` item swaps the image for a player. It is bounded by width rather
 * than height, because an embed cannot be measured from the outside the way an
 * image can.
 */
export const WithVideo: Story = {
  tags: ["!test"],
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

/**
 * The way it is actually used: a thumbnail with a `LightboxTrigger` over it,
 * and `useLightbox` holding the open/index state. Click a frame, then walk the
 * set with the arrow keys or a swipe.
 *
 * `cover` is the variant for stills. Anything with its own controls to press —
 * a video — takes `corner` instead, so the hit area does not swallow them.
 */
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
