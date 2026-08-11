import { Box, Button, Tooltip } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentPropsWithoutRef } from "react";

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
    delay: { control: { type: "number" as const }, table: { defaultValue: { summary: "0" } } },
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
        <Dot size="avatar" />
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

export const AtTheViewportEdges: Story = {
  args: {
    label: "a label far wider than the trigger it hangs off",
    children: <span>trigger</span>,
  },
  parameters: { layout: "fullscreen" as const },
  render: (args) => (
    <Box css={{ display: "flex", justifyContent: "space-between", px: "1", py: "24" }}>
      {EDGES.map((edge) => (
        <Tooltip key={edge} {...args} placement="bottom">
          <Dot size="tiny" />
        </Tooltip>
      ))}
    </Box>
  ),
};

export const Delayed: Story = {
  args: {
    label: "@dmnktoe",
    delay: 1000,
    children: <Button>rest here for a second</Button>,
  },
};

export const Disabled: Story = {
  args: {
    label: "never shown",
    disabled: true,
    children: <Button>nothing happens</Button>,
  },
};

interface DotProps extends ComponentPropsWithoutRef<"span"> {
  size: "avatar" | "tiny";
}

// The tooltip clones its handlers onto the trigger, so the trigger has to pass
// them on to a real element.
function Dot({ size, ...props }: DotProps) {
  return (
    <Box
      as="span"
      {...props}
      css={{
        display: "inline-block",
        w: size === "avatar" ? "8" : "4",
        h: size === "avatar" ? "8" : "4",
        bg: "primary.500",
        border: "1px solid",
        borderColor: "pageBorder",
        borderRadius: "full",
      }}
    />
  );
}

const EDGES = ["left", "right"] as const;
