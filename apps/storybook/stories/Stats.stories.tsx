import { Box, Stats } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const ITEMS = [
  { id: "projects", value: "47", label: "Shipped projects", caption: "Across 9 years" },
  { id: "clients", value: "120+", label: "Happy clients" },
  { id: "uptime", value: "99.98%", label: "Avg. uptime" },
];

const QUAD = [
  ...ITEMS,
  { id: "coffee", value: "∞", label: "Cups of coffee", caption: "Per fortnight" },
];

const meta = {
  title: "UI/Stats",
  component: Stats,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" as const },
      options: ["default", "boxed", "brutalist"],
      table: { defaultValue: { summary: "default" } },
    },
    align: {
      control: { type: "select" as const },
      options: ["left", "center"],
      table: { defaultValue: { summary: "left" } },
    },
    columns: {
      control: { type: "select" as const },
      options: [1, 2, 3, 4],
      table: { defaultValue: { summary: "3" } },
    },
  },
} satisfies Meta<typeof Stats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    items: ITEMS,
    variant: "default",
    align: "left",
    columns: 3,
  },
};

export const Boxed: Story = {
  args: { items: ITEMS, variant: "boxed" },
};

export const Brutalist: Story = {
  args: { items: QUAD, variant: "brutalist", columns: 4 },
};

export const Centered: Story = {
  args: { items: ITEMS, align: "center" },
};

export const Variants: Story = {
  args: { items: ITEMS },
  render: () => (
    <Box css={{ display: "flex", flexDirection: "column", gap: "8" }}>
      <Stats items={ITEMS} variant="default" />
      <Stats items={ITEMS} variant="boxed" />
      <Stats items={ITEMS} variant="brutalist" />
    </Box>
  ),
};
