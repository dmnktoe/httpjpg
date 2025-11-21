import { Loading } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Loading",
  component: Loading,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default rainbow loading text animation
 */
export const Default: Story = {};

/**
 * Loading on dark background
 */
export const DarkBackground: Story = {
  decorators: [
    (Story) => (
      <div style={{ background: "#000", minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};
