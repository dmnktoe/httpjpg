import { Box, FloatingPreviewBadge } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const POSITION_OPTIONS = ["bottom-right", "bottom-left", "top-right", "top-left"] as const;

const meta = {
  title: "Components/FloatingPreviewBadge",
  component: FloatingPreviewBadge,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, iframeHeight: 360 },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    href: {
      control: "text",
      description: "External URL the badge points to",
    },
    label: {
      control: "text",
      description: "Dark label text shown on the left side",
      table: { defaultValue: { summary: "PREVIEW" } },
    },
    value: {
      control: "text",
      description: "Accent-coloured value shown on the right side",
      table: { defaultValue: { summary: "LIVE" } },
    },
    position: {
      control: { type: "select" },
      options: POSITION_OPTIONS,
      description: "Where the badge floats inside its containing viewport",
      table: { defaultValue: { summary: "bottom-right" } },
    },
  },
} satisfies Meta<typeof FloatingPreviewBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const Stage = ({ children }: { children: React.ReactNode }) => (
  <Box
    css={{
      position: "relative",
      height: "320px",
      width: "100%",
      backgroundColor: "neutral.100",
      backgroundImage:
        "linear-gradient(45deg, var(--colors-neutral-200) 25%, transparent 25%), linear-gradient(-45deg, var(--colors-neutral-200) 25%, transparent 25%)",
      backgroundSize: "24px 24px",
      backgroundPosition: "0 0, 0 12px",
    }}
  >
    {children}
  </Box>
);

export const Default: Story = {
  args: {
    href: "https://example.com",
    label: "PREVIEW",
    value: "LIVE",
    position: "bottom-right",
  },
  render: (args) => (
    <Stage>
      <FloatingPreviewBadge {...args} />
    </Stage>
  ),
};

export const TopLeft: Story = {
  args: {
    href: "https://example.com",
    position: "top-left",
  },
  render: (args) => (
    <Stage>
      <FloatingPreviewBadge {...args} />
    </Stage>
  ),
};

export const CustomLabels: Story = {
  args: {
    href: "https://example.com",
    label: "DEMO",
    value: "OPEN",
  },
  render: (args) => (
    <Stage>
      <FloatingPreviewBadge {...args} />
    </Stage>
  ),
};

export const AllPositions: Story = {
  args: {
    href: "https://example.com",
  },
  render: (args) => (
    <Stage>
      {POSITION_OPTIONS.map((position) => (
        <FloatingPreviewBadge key={position} {...args} position={position} value={position} />
      ))}
    </Stage>
  ),
};
