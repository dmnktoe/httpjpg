import { Box, HoloCard, Paragraph, Stack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { holoTextureUrl, OPTIMIZED_IMAGES } from "../shared/storybook-fixtures";

/**
 * Trading-card holo foil (Pokémon-TCG-Pocket style) painted by a WebGL
 * fragment shader on top of a CSS 3D tilt. Move the pointer over the card; on
 * a phone the gyroscope drives it. Without WebGL or under reduced motion the
 * plain image stays.
 */
const meta = {
  title: "Media/HoloCard",
  component: HoloCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "radio" as const },
      options: ["card", "disc"],
      description: "Framed trading card, or a CD with a centre hole",
      table: { defaultValue: { summary: "card" } },
    },
    aspectRatio: { control: "text", description: "Card only — discs are square" },
    intensity: {
      control: { type: "range", min: 0, max: 1, step: 0.05 },
      description: "Strength of rainbow, glitter and glare",
      table: { defaultValue: { summary: "0.8" } },
    },
    maxTilt: {
      control: { type: "range", min: 0, max: 35, step: 1 },
      description: "Max rotation on either axis (deg)",
      table: { defaultValue: { summary: "18" } },
    },
    idle: {
      control: "boolean",
      description: "Slow drift while untouched",
      table: { defaultValue: { summary: "true" } },
    },
    gyro: {
      control: "boolean",
      description: "Follow the device gyroscope (iOS asks via a tap)",
      table: { defaultValue: { summary: "true" } },
    },
    frame: {
      control: { type: "range", min: 0, max: 0.12, step: 0.005 },
      description: "Card only — frame width as a fraction of the shorter side",
      table: { defaultValue: { summary: "0.045" } },
    },
    depth: {
      control: { type: "range", min: 0, max: 2, step: 0.1 },
      description: "Parallax strength between photo, glitter, stars and the optional cut-out",
      table: { defaultValue: { summary: "1" } },
    },
    foil: {
      control: { type: "radio" as const },
      options: ["silver", "swirl"],
      description: "Frame foil: pastel silver or dark oil-slick swirl",
      table: { defaultValue: { summary: "silver" } },
    },
    sparkle: {
      control: { type: "radio" as const },
      options: ["stars", "fireworks", "none"],
      description: "Twinkling sparkles over the art",
      table: { defaultValue: { summary: "stars" } },
    },
    effectsSrc: {
      control: "text",
      description: "Shards layer on the overhang frame (card + 18% per side)",
    },
    depthSrc: {
      control: "text",
      description: "Greyscale depth map, white = far, same framing as `src`",
    },
    textureSrc: {
      control: "text",
      description: "Same-origin copy of `src` for the WebGL texture (CDNs without CORS)",
    },
    foregroundSrc: {
      control: "text",
      description: "Cut-out (alpha) with the same framing as `src`, floats in front",
    },
    radius: {
      control: { type: "range", min: 0, max: 40, step: 1 },
      description: "Card only — corner radius (px)",
      table: { defaultValue: { summary: "14" } },
    },
    copyrightSource: {
      control: "text",
      description: "Asset source/credit, shown as a second line below the copyright",
    },
  },
} satisfies Meta<typeof HoloCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = {
  args: {
    src: "/images/holo/hello.webp",
    alt: "Y2K collage of chrome hearts, crystals and Hello Kitty on a pink sky",
    variant: "card",
    aspectRatio: "5/7",
    // bright pastel art takes the foil strongly; keep it readable
    intensity: 0.6,
    maxTilt: 18,
    idle: true,
    gyro: true,
  },
  render: (args) => (
    <Box css={{ maxW: "360px", mx: "auto", py: 8 }}>
      <HoloCard {...args} />
    </Box>
  ),
};

/**
 * The layered look: a photo plus a cut-out of its subject with the same
 * framing. The cut-out floats in front with its own parallax, shadow and
 * rainbow outline while the backdrop slides the other way. Demo files live
 * in `apps/portfolio/public/images/holo/` (cut from the portfolio's own
 * Storyblok assets).
 */
export const LayeredCutOut: Story = {
  name: "Layered (foreground cut-out)",
  args: {
    src: "/images/holo/cryo.webp",
    foregroundSrc: "/images/holo/cryo-fg.webp",
    alt: "CRYONiQ cryosauna with open doors, cold mist flowing out",
    variant: "card",
    aspectRatio: "5/7",
    intensity: 0.85,
    maxTilt: 20,
    depth: 1.4,
    idle: true,
    gyro: true,
  },
  render: (args) => (
    <Box css={{ maxW: "360px", mx: "auto", py: 8 }}>
      <HoloCard {...args} />
    </Box>
  ),
};

/**
 * Every layer the Blender pipeline (`pnpm holo:render`) produces: photo,
 * cut-out, shards on the overhang frame and a depth map, with the swirl foil
 * and firework sparkles of the Mew / Team Rocket cards.
 */
export const FullStack: Story = {
  name: "Full stack (swirl, fireworks, effects, depth)",
  args: {
    src: "/images/holo/cryo.webp",
    foregroundSrc: "/images/holo/cryo-fg.webp",
    effectsSrc: "/images/holo/cryo-fx.webp",
    depthSrc: "/images/holo/cryo-depth.webp",
    alt: "CRYONiQ cryosauna bursting out of the card in a cloud of ice shards",
    variant: "card",
    aspectRatio: "5/7",
    intensity: 0.85,
    maxTilt: 20,
    depth: 1.4,
    foil: "swirl",
    sparkle: "fireworks",
    idle: true,
    gyro: true,
  },
  render: (args) => (
    <Box css={{ maxW: "360px", mx: "auto", py: 8 }}>
      <HoloCard {...args} />
    </Box>
  ),
};

/** Flat art plus an effects layer: no cut-out, the shards alone carry the depth. */
export const EffectsOnly: Story = {
  name: "Effects layer only",
  args: {
    ...Card.args,
    effectsSrc: "/images/holo/hello-fx.webp",
    sparkle: "fireworks",
    depth: 1.2,
  },
  render: (args) => (
    <Box css={{ maxW: "360px", mx: "auto", py: 8 }}>
      <HoloCard {...args} />
    </Box>
  ),
};

export const Disc: Story = {
  args: {
    src: OPTIMIZED_IMAGES.outletStore1,
    textureSrc: holoTextureUrl(OPTIMIZED_IMAGES.outletStore1),
    alt: "Outlet store",
    variant: "disc",
    intensity: 0.85,
    maxTilt: 22,
    idle: true,
    gyro: true,
  },
  render: (args) => (
    <Box css={{ maxW: "420px", mx: "auto", py: 8 }}>
      <HoloCard {...args} />
    </Box>
  ),
};

export const WithCredit: Story = {
  args: {
    src: OPTIMIZED_IMAGES.portrait,
    textureSrc: holoTextureUrl(OPTIMIZED_IMAGES.portrait),
    alt: "Klosterkirche Nordshausen",
    variant: "card",
    aspectRatio: "5/7",
    copyright: "httpjpg",
    copyrightSource: "Kodak Portra 400",
  },
  render: (args) => (
    <Box css={{ maxW: "360px", mx: "auto", py: 8 }}>
      <HoloCard {...args}>
        <Paragraph css={{ mt: 2, color: "pageMuted", fontSize: "sm" }}>
          Caption slot renders below the card, outside the tilt.
        </Paragraph>
      </HoloCard>
    </Box>
  ),
};

export const Still: Story = {
  name: "Still (no idle drift)",
  args: { ...Card.args, idle: false, intensity: 0.6 },
  render: (args) => (
    <Stack css={{ maxW: "360px", mx: "auto", py: 8 }}>
      <HoloCard {...args} />
    </Stack>
  ),
};
