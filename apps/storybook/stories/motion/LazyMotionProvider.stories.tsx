import { Box, LazyMotionProvider } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { m } from "motion/react";

/**
 * Loads the `domMax` feature bundle once for the `m.*` components below it. Mount it once at the
 * app root; every story here already renders inside it through the Storybook decorator.
 */
const meta = {
  title: "Motion/LazyMotionProvider",
  component: LazyMotionProvider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: { control: false, description: "Tree that may use `m.*` components" },
  },
  args: { children: null },
} satisfies Meta<typeof LazyMotionProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `strict` makes a full `motion.*` component throw inside the provider, so only `m.*` ships.
 */
export const WithMotionChild: Story = {
  render: () => (
    <LazyMotionProvider>
      <m.div animate={{ x: [0, 24, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
        <Box css={{ p: "4", fontFamily: "mono", border: "2px solid", borderColor: "pageFg" }}>
          [ m.div ]
        </Box>
      </m.div>
    </LazyMotionProvider>
  ),
};
