import { Box, ImageComparisonSlider, Stack } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { OPTIMIZED_IMAGES } from "../shared/storybook-fixtures";

/**
 * Before / after slider with lightbox-style ASCII chrome: `[ BEFORE ]`,
 * `[ ↔ ]` handle, `[ NNN / 100 ]` readout. Drag or use the arrow keys.
 */
const meta = {
  title: "Media/ImageComparisonSlider",
  component: ImageComparisonSlider,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: { type: "select" as const },
      options: ["horizontal", "vertical"] as const,
      table: { defaultValue: { summary: "horizontal" } },
    },
    initialPosition: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      table: { defaultValue: { summary: "50" } },
    },
    showLabels: { control: "boolean" },
    showPosition: { control: "boolean" },
    aspectRatio: { control: "text" },
    beforeLabel: { control: "text" },
    afterLabel: { control: "text" },
  },
} satisfies Meta<typeof ImageComparisonSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    beforeSrc: OPTIMIZED_IMAGES.outletStore1,
    afterSrc: OPTIMIZED_IMAGES.outletStore2,
    beforeAlt: "Outlet store, ungraded still",
    afterAlt: "Outlet store, graded still",
    aspectRatio: "21/9",
    initialPosition: 50,
    showLabels: true,
    showPosition: true,
  },
};

export const Vertical: Story = {
  args: {
    beforeSrc: OPTIMIZED_IMAGES.portrait,
    afterSrc: OPTIMIZED_IMAGES.videoStill1,
    beforeAlt: "Portrait grade A",
    afterAlt: "Portrait grade B",
    orientation: "vertical",
    aspectRatio: "3/4",
    beforeLabel: "DRAFT",
    afterLabel: "FINAL",
  },
  decorators: [
    (StoryFn) => (
      <Box css={{ maxW: "420px", mx: "auto" }}>
        <StoryFn />
      </Box>
    ),
  ],
};

export const Square: Story = {
  args: {
    beforeSrc: OPTIMIZED_IMAGES.videoStill2,
    afterSrc: OPTIMIZED_IMAGES.videoStill3,
    beforeAlt: "Square still A",
    afterAlt: "Square still B",
    aspectRatio: "1/1",
    beforeLabel: "IN",
    afterLabel: "OUT",
    initialPosition: 38,
  },
  decorators: [
    (StoryFn) => (
      <Box css={{ maxW: "520px", mx: "auto" }}>
        <StoryFn />
      </Box>
    ),
  ],
};

export const Minimal: Story = {
  args: {
    beforeSrc: OPTIMIZED_IMAGES.landscape,
    afterSrc: OPTIMIZED_IMAGES.videoStill1,
    beforeAlt: "Landscape",
    afterAlt: "Video still",
    aspectRatio: "16/9",
    showLabels: false,
    showPosition: false,
  },
};

export const CustomLabels: Story = {
  args: {
    beforeSrc: OPTIMIZED_IMAGES.outletStore2,
    afterSrc: OPTIMIZED_IMAGES.outletStore3,
    beforeAlt: "Daylight",
    afterAlt: "Tungsten",
    aspectRatio: "21/9",
    beforeLabel: "DAY",
    afterLabel: "NIGHT",
    initialPosition: 62,
  },
};

export const Pair: Story = {
  args: {
    beforeSrc: OPTIMIZED_IMAGES.outletStore1,
    afterSrc: OPTIMIZED_IMAGES.outletStore2,
    beforeAlt: "",
    afterAlt: "",
  },
  render: () => (
    <Stack direction="vertical" gap="8" css={{ maxW: "960px", mx: "auto" }}>
      <ImageComparisonSlider
        beforeSrc={OPTIMIZED_IMAGES.outletStore1}
        afterSrc={OPTIMIZED_IMAGES.outletStore2}
        beforeAlt="Outlet store, pass one"
        afterAlt="Outlet store, pass two"
        aspectRatio="21/9"
      />
      <ImageComparisonSlider
        beforeSrc={OPTIMIZED_IMAGES.landscape}
        afterSrc={OPTIMIZED_IMAGES.videoStill3}
        beforeAlt="Exterior, before grade"
        afterAlt="Exterior, after grade"
        aspectRatio="16/9"
        beforeLabel="RAW"
        afterLabel="GRADE"
        initialPosition={44}
      />
    </Stack>
  ),
};
