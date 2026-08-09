import { Box, Button, Tooltip } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const PLACEMENTS = ["top", "bottom"] as const;

const meta = {
  title: "Display/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: { type: "select" as const },
      options: PLACEMENTS,
      table: { defaultValue: { summary: "top" } },
    },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: "@dmnktoe",
    placement: "top",
    children: <Button>hover me</Button>,
  },
};

export const Placements: Story = {
  args: { label: "@dmnktoe", children: <span>trigger</span> },
  render: (args) => (
    <Box css={{ display: "flex", gap: "12", py: "12" }}>
      {PLACEMENTS.map((placement) => (
        <Tooltip key={placement} {...args} placement={placement}>
          <Box as="span" css={{ fontFamily: "mono", fontSize: "sm" }}>
            {placement}
          </Box>
        </Tooltip>
      ))}
    </Box>
  ),
};

export const OnAnAvatar: Story = {
  args: { label: "@dmnktoe", children: <span>trigger</span> },
  render: (args) => (
    <Box css={{ py: "12" }}>
      <Tooltip {...args}>
        <Box
          as="span"
          css={{
            display: "inline-block",
            w: "8",
            h: "8",
            bg: "primary.500",
            border: "1px solid",
            borderColor: "pageBorder",
            borderRadius: "full",
          }}
        />
      </Tooltip>
    </Box>
  ),
};

export const LongLabel: Story = {
  args: {
    label: "the frame grows with the label",
    children: <Button>hover me</Button>,
  },
};

export const Disabled: Story = {
  args: {
    label: "never shown",
    disabled: true,
    children: <Button>nothing happens</Button>,
  },
};
