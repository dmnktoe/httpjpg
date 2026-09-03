import { Box, EditorChrome, FloatingPreviewBadge } from "@httpjpg/ui";
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
      description: "Work-page live URL. Omit when the story has no external link.",
    },
    label: {
      control: "text",
      description: "Label shown inside the preview pill on desktop",
      table: { defaultValue: { summary: "preview" } },
    },
    accentColor: {
      control: "color",
      description: "Work page Project Accent Color — tints the preview pill only",
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

/** Draft / Visual Editor chrome. Preview is optional content; grid lives here. */
export const EditorActions: Story = {
  render: () => (
    <Stage>
      <EditorChrome
        previewHref="https://example.com"
        editHref="https://app.storyblok.com/#/me/spaces/1/stories/0/0/2"
        accentColor="#EC6839"
      />
    </Stage>
  ),
};

export const DraftWithoutWorkUrl: Story = {
  render: () => (
    <Stage>
      <EditorChrome editHref="https://app.storyblok.com/#/me/spaces/1/stories/0/0/2" />
    </Stage>
  ),
};

/**
 * The same hex that tints iOS liquid-glass icons. Set on the preview pill
 * so the tint does not leak onto editor tools in the same row.
 */
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
