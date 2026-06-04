import { Box, FloatingPreviewBadge } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Display/FloatingPreviewBadge",
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
      description: "Label shown inside the pill on desktop",
      table: { defaultValue: { summary: "preview" } },
    },
  },
} satisfies Meta<typeof FloatingPreviewBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const Stage = ({ children }: { children: React.ReactNode }) => (
  <Box
    css={{
      position: "relative",
      width: "100%",
      height: "320px",
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
    label: "preview",
  },
  render: (args) => (
    <Stage>
      <FloatingPreviewBadge {...args} />
    </Stage>
  ),
};

export const CustomLabel: Story = {
  args: {
    href: "https://example.com",
    label: "DEMO",
  },
  render: (args) => (
    <Stage>
      <FloatingPreviewBadge {...args} />
    </Stage>
  ),
};
