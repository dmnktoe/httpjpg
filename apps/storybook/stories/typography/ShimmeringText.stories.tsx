import { Box, ShimmeringText } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Typography/ShimmeringText",
  component: ShimmeringText,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    text: "Agent is thinking…",
  },
  argTypes: {
    text: { control: "text" },
    duration: { control: { type: "range", min: 0.5, max: 6, step: 0.1 } },
    delay: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    repeatDelay: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
    spread: {
      control: { type: "range", min: 1, max: 8, step: 1 },
      description: "Highlight width, multiplied by the character count.",
    },
    repeat: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    startOnView: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    once: { control: "boolean", table: { defaultValue: { summary: "false" } } },
    color: { control: "color" },
    shimmerColor: { control: "color" },
  },
} satisfies Meta<typeof ShimmeringText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { startOnView: false },
};

/** One sweep and done — how the header's ⌘+𝙆 announces itself. */
export const SingleSweep: Story = {
  args: {
    text: "⌘+𝙆",
    repeat: false,
    startOnView: false,
    duration: 1.2,
    delay: 0.15,
    color: "#3B82F6",
    shimmerColor: "#BFDBFE",
  },
};

export const Looping: Story = {
  args: {
    text: "Processing your request…",
    repeat: true,
    repeatDelay: 1,
    duration: 2,
    startOnView: false,
  },
};

/** Scroll the panel to trigger the sweep; `once` keeps it from replaying. */
export const OnScrollIntoView: Story = {
  args: { text: "Appears when scrolled into view", startOnView: true, once: true },
  render: (args) => (
    <Box
      css={{
        w: "24rem",
        h: "220px",
        border: "1px dashed",
        borderColor: "pageBorder",
        overflowY: "auto",
      }}
    >
      <Box css={{ h: "200px", p: "4", opacity: 0.4, fontFamily: "mono", fontSize: "sm" }}>
        scroll down ↓
      </Box>
      <Box css={{ p: "4" }}>
        <ShimmeringText {...args} />
      </Box>
      <Box css={{ h: "200px" }} />
    </Box>
  ),
};

/** Reduced motion drops the gradient entirely and renders the plain string. */
export const CustomColors: Story = {
  args: {
    text: "Custom Shimmer",
    startOnView: false,
    color: "#6B7280",
    shimmerColor: "#3B82F6",
  },
};
