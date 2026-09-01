import { Box, FloatingPreviewBadge } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties, ReactNode } from "react";

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

const Stage = ({ children }: { children: ReactNode }) => (
  <Box
    css={{
      position: "relative",
      width: "100%",
      height: "320px",
      backgroundColor: "neutral.100",
      backgroundImage:
        "linear-gradient(45deg, {colors.neutral.200} 25%, transparent 25%), linear-gradient(-45deg, {colors.neutral.200} 25%, transparent 25%)",
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

/**
 * On a work page the badge inherits `--work-accent*` from `html`, the same
 * tokens that tint the iOS liquid-glass preview button.
 */
export const WorkAccent: Story = {
  args: {
    href: "https://example.com",
    label: "preview",
  },
  render: (args) => (
    <Box
      style={
        {
          "--work-accent": "#EC6839",
          "--work-on-accent": "#ffffff",
          "--work-accent-fill": "rgba(236, 104, 57, 0.62)",
          "--work-accent-fill-hover": "rgba(236, 104, 57, 0.78)",
        } as CSSProperties
      }
    >
      <Stage>
        <FloatingPreviewBadge {...args} />
      </Stage>
    </Box>
  ),
};
