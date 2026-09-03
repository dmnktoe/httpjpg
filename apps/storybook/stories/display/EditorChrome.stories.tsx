import { Box, EditorChrome } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";

/**
 * Draft / Visual Editor chrome. Owns draft, edit, exit, and the 12-col grid.
 * Optional work preview is composed into the same row; accent tints only that pill.
 */
const meta = {
  title: "Display/EditorChrome",
  component: EditorChrome,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, iframeHeight: 360 },
      description: {
        component:
          "Layout-owned draft chrome. Preview ↗ is optional content from the page, not an editor control.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    previewHref: {
      control: "text",
      description: "Work-page live URL. Omit when the story has no external link.",
    },
    editHref: {
      control: "text",
      description: "Visual Editor deep-link from `_editable`.",
    },
    accentColor: {
      control: "color",
      description: "Tints the preview pill only. Editor tools stay on the default glass.",
    },
  },
} satisfies Meta<typeof EditorChrome>;

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
    editHref: "https://app.storyblok.com/#/me/spaces/1/stories/0/0/2",
  },
  render: (args) => (
    <Stage>
      <EditorChrome {...args} />
    </Stage>
  ),
};

export const WithWorkPreview: Story = {
  args: {
    previewHref: "https://example.com",
    editHref: "https://app.storyblok.com/#/me/spaces/1/stories/0/0/2",
    accentColor: "#EC6839",
  },
  render: (args) => (
    <Stage>
      <EditorChrome {...args} />
    </Stage>
  ),
};
