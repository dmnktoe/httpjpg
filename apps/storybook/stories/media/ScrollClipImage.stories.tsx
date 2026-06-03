import { Box, Headline, Paragraph, ScrollClipImage, Stack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { OPTIMIZED_IMAGES } from "../shared/storybook-fixtures";

const meta = {
  title: "Media/ScrollClipImage",
  component: ScrollClipImage,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  argTypes: {
    pin: {
      control: "boolean",
      description: "Pin at viewport center and play the reveal across `pinDistance` of scroll",
      table: { defaultValue: { summary: "false" } },
    },
    pinDistance: {
      control: "text",
      description: "Pin mode only — CSS length controlling how long the pin lasts",
      table: { defaultValue: { summary: "100vh" } },
    },
    maxClipRatio: {
      control: { type: "range", min: 0, max: 30, step: 0.5 },
      description: "Initial clip-path inset (%) — decays to 0 over the reveal",
      table: { defaultValue: { summary: "10" } },
    },
    maxScale: {
      control: { type: "range", min: 1, max: 1.6, step: 0.01 },
      description: "Initial image scale — decays to 1 over the reveal",
      table: { defaultValue: { summary: "1.1" } },
    },
    brackets: {
      control: "boolean",
      description: "ASCII corner brackets that follow the mask edges",
      table: { defaultValue: { summary: "true" } },
    },
    showProgress: {
      control: "boolean",
      description: "Pin mode only — `[NN/99]` progress label",
      table: { defaultValue: { summary: "true" } },
    },
    aspectRatio: { control: "text" },
  },
} satisfies Meta<typeof ScrollClipImage>;

export default meta;
type Story = StoryObj<typeof meta>;

const Spacer = ({ label }: { label: string }) => (
  <Box
    css={{
      height: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "mono",
      fontSize: "xs",
      opacity: 0.4,
      borderTop: "1px dashed",
      borderColor: "neutral.300",
      _pageDark: { borderColor: "neutral.700" },
    }}
  >
    ↓ {label} — scroll down ↓
  </Box>
);

export const Default: Story = {
  args: {
    src: OPTIMIZED_IMAGES.landscape,
    alt: "Klosterkirche Nordshausen",
    aspectRatio: "16/9",
    pin: false,
    maxClipRatio: 10,
    maxScale: 1.1,
    brackets: true,
  },
  render: (args) => (
    <Stack direction="vertical" gap="0" css={{ maxWidth: "1024px", mx: "auto", px: 6 }}>
      <Spacer label="scroll target below" />
      <Box css={{ py: 8 }}>
        <Headline as="h2" level={2} css={{ mb: "4" }}>
          [ scroll-clip ]
        </Headline>
        <Paragraph css={{ mb: "6", opacity: 0.7 }}>
          As this image enters the viewport, the clip-path inset retreats from {args.maxClipRatio}%
          to 0 and the image scales down from {args.maxScale} to 1. ASCII corner brackets ride the
          mask edges.
        </Paragraph>
        <ScrollClipImage {...args} />
      </Box>
      <Spacer label="more content" />
    </Stack>
  ),
};

export const Gallery: Story = {
  args: {
    src: OPTIMIZED_IMAGES.landscape,
    alt: "",
  },
  render: () => (
    <Stack direction="vertical" gap="16" css={{ p: 6, maxWidth: "960px", mx: "auto" }}>
      <Spacer label="gallery starts here" />
      <ScrollClipImage
        src={OPTIMIZED_IMAGES.landscape}
        alt="Landscape"
        aspectRatio="21/9"
        copyright="2025 httpjpg"
        copyrightPosition="overlay"
      />
      <ScrollClipImage
        src={OPTIMIZED_IMAGES.videoStill2}
        alt="Video still"
        aspectRatio="16/9"
        maxClipRatio={14}
        maxScale={1.14}
      />
      <ScrollClipImage
        src={OPTIMIZED_IMAGES.portrait}
        alt="Portrait"
        aspectRatio="3/4"
        maxClipRatio={6}
        maxScale={1.06}
        copyright="2025 Studio"
        copyrightPosition="inline-white"
      />
      <ScrollClipImage
        src={OPTIMIZED_IMAGES.videoStill3}
        alt="Video still"
        aspectRatio="16/9"
        brackets={false}
      />
      <Spacer label="end" />
    </Stack>
  ),
};

export const Linked: Story = {
  args: {
    src: OPTIMIZED_IMAGES.videoStill1,
    alt: "Linked image",
    aspectRatio: "16/9",
    href: "https://example.com",
    title: "Open example",
    maxClipRatio: 12,
    maxScale: 1.12,
  },
  render: (args) => (
    <Stack direction="vertical" gap="0" css={{ p: 6, maxWidth: "1024px", mx: "auto" }}>
      <Spacer label="scroll to reveal" />
      <ScrollClipImage {...args} />
      <Spacer label="…" />
    </Stack>
  ),
};

export const Pinned: Story = {
  args: {
    src: OPTIMIZED_IMAGES.landscape,
    alt: "Pinned landscape",
    aspectRatio: "16/9",
    pin: true,
    pinDistance: "100vh",
    maxClipRatio: 12,
    maxScale: 1.15,
    brackets: true,
    showProgress: true,
  },
  render: (args) => (
    <Stack direction="vertical" gap="0" css={{ maxWidth: "1200px", mx: "auto", px: 6 }}>
      <Spacer label="scroll toward the pin" />
      <Box css={{ py: 8 }}>
        <Headline as="h2" level={2} css={{ mb: "4" }}>
          [ pinned reveal ]
        </Headline>
        <Paragraph css={{ mb: "6", opacity: 0.7 }}>
          With <code>pin</code> on, the image sticks at viewport center while the mask retreats over{" "}
          <code>{args.pinDistance}</code> of scroll. A progress label tracks the reveal in the
          corner.
        </Paragraph>
      </Box>
      <ScrollClipImage {...args} />
      <Spacer label="released — keep going" />
    </Stack>
  ),
};

export const PinnedLong: Story = {
  args: {
    src: OPTIMIZED_IMAGES.videoStill1,
    alt: "Long pinned reveal",
    aspectRatio: "21/9",
    pin: true,
    pinDistance: "200vh",
    maxClipRatio: 18,
    maxScale: 1.2,
    brackets: true,
    showProgress: true,
  },
  render: (args) => (
    <Stack direction="vertical" gap="0">
      <Spacer label="long pin coming up (200vh travel)" />
      <ScrollClipImage {...args} />
      <Spacer label="end" />
    </Stack>
  ),
};

export const PinnedMinimal: Story = {
  args: {
    src: OPTIMIZED_IMAGES.videoStill3,
    alt: "Minimal pinned reveal",
    aspectRatio: "16/9",
    pin: true,
    pinDistance: "80vh",
    maxClipRatio: 8,
    maxScale: 1.08,
    brackets: false,
    showProgress: false,
  },
  render: (args) => (
    <Stack direction="vertical" gap="0">
      <Spacer label="minimal — no ascii furniture" />
      <ScrollClipImage {...args} />
      <Spacer label="end" />
    </Stack>
  ),
};
