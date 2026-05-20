import { Box, Image, ImageOverlay, type OverlayPattern } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { OPTIMIZED_IMAGES } from "./storybook-fixtures";

const meta = {
  title: "Animation & Effects/ImageOverlay",
  component: ImageOverlay,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    pattern: {
      control: { type: "select" as const },
      options: [
        "none",
        "random",
        "stars",
        "sparkles",
        "hearts",
        "confetti",
        "tape",
        "dots",
        "arrows",
        "ghost",
        "bracket",
        "noise",
        "runes",
      ] satisfies OverlayPattern[],
    },
    seed: { control: "text" },
    size: { control: "text" },
    color: { control: "color" },
    opacity: { control: { type: "range", min: 0, max: 1, step: 0.1 } },
  },
} satisfies Meta<typeof ImageOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Box css={{ position: "relative", maxWidth: "560px", mx: "auto" }}>
      <Image src={OPTIMIZED_IMAGES.landscape} alt="frame" aspectRatio="16/9" />
      {children}
    </Box>
  );
}

export const Playground: Story = {
  args: {
    pattern: "random",
    seed: "demo-image-1",
    size: "1rem",
    color: "currentColor",
    opacity: 0.85,
  },
  render: (args) => (
    <Frame>
      <ImageOverlay {...args} />
    </Frame>
  ),
};

export const AllPatterns: Story = {
  args: { pattern: "stars" },
  render: () => (
    <Box
      css={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "6",
      }}
    >
      {(
        [
          "stars",
          "sparkles",
          "hearts",
          "confetti",
          "tape",
          "dots",
          "arrows",
          "ghost",
          "bracket",
          "noise",
          "runes",
        ] satisfies OverlayPattern[]
      ).map((p) => (
        <Box key={p}>
          <Box
            css={{
              fontFamily: "mono",
              fontSize: "xs",
              opacity: 0.6,
              mb: "2",
              textTransform: "uppercase",
              letterSpacing: "wider",
            }}
          >
            {p}
          </Box>
          <Box css={{ position: "relative" }}>
            <Image src={OPTIMIZED_IMAGES.landscape} alt={p} aspectRatio="4/3" />
            <ImageOverlay pattern={p} opacity={0.9} color="currentColor" />
          </Box>
        </Box>
      ))}
    </Box>
  ),
};

export const DeterministicRandom: Story = {
  args: { pattern: "random" },
  render: () => (
    <Box
      css={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "6",
      }}
    >
      {[
        "image-alpha",
        "image-beta",
        "image-gamma",
        "image-delta",
        "image-epsilon",
        "image-zeta",
      ].map((seed) => (
        <Box key={seed}>
          <Box
            css={{
              fontFamily: "mono",
              fontSize: "xs",
              opacity: 0.6,
              mb: "2",
            }}
          >
            seed: {seed}
          </Box>
          <Box css={{ position: "relative" }}>
            <Image src={OPTIMIZED_IMAGES.landscape} alt={seed} aspectRatio="4/3" />
            <ImageOverlay pattern="random" seed={seed} opacity={0.9} />
          </Box>
        </Box>
      ))}
    </Box>
  ),
};
