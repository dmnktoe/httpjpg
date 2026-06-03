"use client";

import { Box, Headline, Image, Paragraph, Stack, useParallax } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { OPTIMIZED_IMAGES } from "../shared/storybook-fixtures";

interface ParallaxArgs {
  speed: number;
  disabled: boolean;
}

function HookHost(_args: ParallaxArgs) {
  return null;
}

const meta = {
  title: "Utilities/useParallax",
  component: HookHost,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Scroll-driven parallax hook from `@httpjpg/ui`. Returns a `ref` to attach to a wrapper " +
          "plus a `translateY` (px) that tracks the element's distance from viewport center. " +
          "Idle when offscreen, respects `prefers-reduced-motion`.",
      },
    },
  },
  argTypes: {
    speed: {
      control: { type: "range", min: 0, max: 0.5, step: 0.05 },
      description: "Strength multiplier (positive = opposite scroll direction)",
      table: { defaultValue: { summary: "0.15" } },
    },
    disabled: {
      control: "boolean",
      description: "Skip the effect entirely",
      table: { defaultValue: { summary: "false" } },
    },
  },
} satisfies Meta<typeof HookHost>;

export default meta;
type Story = StoryObj<typeof meta>;

function ParallaxBlock({
  speed,
  disabled,
  src,
  label,
}: ParallaxArgs & { src: string; label: string }) {
  const { ref, offset } = useParallax<HTMLDivElement>({ speed, disabled });

  return (
    <Box
      css={{
        position: "relative",
        height: "60vh",
        overflow: "hidden",
        border: "2px solid",
        borderColor: "pageFg",
      }}
    >
      <Box
        ref={ref}
        style={{ transform: `translateY(${offset}px)` }}
        css={{
          position: "absolute",
          inset: "-20% 0",
          willChange: "transform",
        }}
      >
        <Image src={src} alt={label} aspectRatio="16/9" />
      </Box>
      <Box
        css={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textShadow: "0 2px 8px rgba(0,0,0,0.6)",
        }}
      >
        <Stack direction="vertical" gap="2" css={{ textAlign: "center" }}>
          <Headline level={2}>{label}</Headline>
          <Paragraph
            size="sm"
            css={{
              fontFamily: "mono",
              opacity: 0.8,
              letterSpacing: "wider",
              textTransform: "uppercase",
            }}
          >
            offset: {offset.toFixed(1)}px · speed: {speed}
          </Paragraph>
        </Stack>
      </Box>
    </Box>
  );
}

export const Playground: Story = {
  args: {
    speed: 0.15,
    disabled: false,
  },
  render: (args: ParallaxArgs) => (
    <Stack direction="vertical" gap="0">
      <Box css={{ p: "8", textAlign: "center" }}>
        <Paragraph color="muted" css={{ mb: "2" }}>
          ↓ scroll through the blocks ↓
        </Paragraph>
        <Paragraph size="sm" color="muted">
          Adjust `speed` in the controls; the offset updates live with viewport position.
        </Paragraph>
      </Box>
      <ParallaxBlock {...args} src={OPTIMIZED_IMAGES.videoStill1} label="BLOCK ONE" />
      <Box css={{ p: "16", bg: "pageBg" }}>
        <Stack direction="vertical" gap="3" css={{ maxW: "55ch", mx: "auto" }}>
          <Headline level={3}>Filler content</Headline>
          <Paragraph color="muted">
            The parallax effect uses `IntersectionObserver` so offscreen blocks do no work.
            `getBoundingClientRect()` runs only while the element is in view, throttled with
            `requestAnimationFrame`.
          </Paragraph>
        </Stack>
      </Box>
      <ParallaxBlock {...args} src={OPTIMIZED_IMAGES.landscape} label="BLOCK TWO" />
      <Box css={{ p: "16", bg: "pageBg" }}>
        <Paragraph color="muted" css={{ maxW: "55ch", mx: "auto", textAlign: "center" }}>
          Try increasing the speed to 0.3+ for a more dramatic effect, or toggle `disabled` to
          freeze the offset at 0.
        </Paragraph>
      </Box>
      <ParallaxBlock {...args} src={OPTIMIZED_IMAGES.videoStill3} label="BLOCK THREE" />
    </Stack>
  ),
};

export const Disabled: Story = {
  args: {
    speed: 0.15,
    disabled: true,
  },
  render: (args: ParallaxArgs) => (
    <Stack direction="vertical" gap="0">
      <Box css={{ p: "8", textAlign: "center" }}>
        <Paragraph color="muted">
          `disabled: true` — the offset stays at 0 regardless of scroll position.
        </Paragraph>
      </Box>
      <ParallaxBlock {...args} src={OPTIMIZED_IMAGES.videoStill1} label="STATIC" />
    </Stack>
  ),
};
