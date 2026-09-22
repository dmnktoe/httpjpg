import { Box, FloatingBadge, workPreviewAction } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";

const meta = {
  title: "Display/FloatingBadge",
  component: FloatingBadge,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, iframeHeight: 360 },
      description: {
        component: "Portalled glass pills. `accentColor` tints pills marked `accented`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    accentColor: {
      control: "color",
      description: "Work page Project Accent Color — tints accented pills only",
    },
  },
} satisfies Meta<typeof FloatingBadge>;

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
  render: () => (
    <Stage>
      <FloatingBadge actions={[workPreviewAction("https://example.com")]} />
    </Stage>
  ),
};

export const CustomLabel: Story = {
  render: () => (
    <Stage>
      <FloatingBadge actions={[workPreviewAction("https://example.com", "DEMO")]} />
    </Stage>
  ),
};

export const WorkAccent: Story = {
  args: {
    accentColor: "#EC6839",
  },
  render: (args) => (
    <Stage>
      <FloatingBadge {...args} actions={[workPreviewAction("https://example.com")]} />
    </Stage>
  ),
};
