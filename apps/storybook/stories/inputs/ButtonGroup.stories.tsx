import { Button, ButtonGroup } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Inputs/ButtonGroup",
  component: ButtonGroup,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    gap: { control: { type: "text" as const }, table: { defaultValue: { summary: "3" } } },
    direction: {
      control: { type: "radio" as const },
      options: ["row", "column"],
      table: { defaultValue: { summary: "row" } },
    },
    align: {
      control: { type: "select" as const },
      options: ["start", "center", "end"],
      table: { defaultValue: { summary: "center" } },
    },
    justify: {
      control: { type: "select" as const },
      options: ["start", "center", "end", "between"],
      table: { defaultValue: { summary: "start" } },
    },
    wrap: { control: { type: "boolean" as const }, table: { defaultValue: { summary: "true" } } },
    stretch: {
      control: { type: "boolean" as const },
      table: { defaultValue: { summary: "false" } },
    },
  },
  args: {
    children: [
      <Button key="primary">Get in touch</Button>,
      <Button key="secondary" variant="secondary">
        See the work
      </Button>,
    ],
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Column: Story = {
  args: { direction: "column", align: "start" },
};

export const Centered: Story = {
  args: { justify: "center" },
};

export const Stretched: Story = {
  args: { stretch: true },
};

export const MixedSizes: Story = {
  args: {
    children: [
      <Button key="lg" size="lg">
        Large
      </Button>,
      <Button key="md" variant="secondary">
        Medium
      </Button>,
      <Button key="sm" variant="secondary" size="sm">
        Small
      </Button>,
    ],
  },
};
