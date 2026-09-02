import { Box, FloatingPreviewBadge } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";

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
    accentColor: {
      control: "color",
      description: "Work page Project Accent Color — tints the portalled glass pill",
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
 * The same hex that tints iOS liquid-glass icons. Set on the portalled node
 * so the pill does not depend on `html` custom properties.
 */
export const EditorActions: Story = {
  args: {
    href: "https://example.com",
    label: "preview",
    gridToggle: true,
    actions: [
      {
        href: "https://app.storyblok.com/#/me/spaces/1/stories/0/0/2",
        label: "edit",
        glyph: "✎",
        ariaLabel: "Edit in Storyblok",
      },
      {
        href: "/api/exit-draft",
        label: "exit",
        glyph: "×",
        ariaLabel: "Exit draft preview",
        external: false,
      },
    ],
  },
  render: (args) => (
    <Stage>
      <FloatingPreviewBadge {...args} />
    </Stage>
  ),
};

export const WorkAccent: Story = {
  args: {
    href: "https://example.com",
    label: "preview",
    accentColor: "#EC6839",
  },
  render: (args) => (
    <Stage>
      <FloatingPreviewBadge {...args} />
    </Stage>
  ),
};
