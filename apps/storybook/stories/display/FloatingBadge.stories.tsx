import { Box, FloatingBadge, type FloatingBadgeAction } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";

/**
 * Presentational glass pill row. Pages use `PageBadge`, which builds the
 * actions; reach for `FloatingBadge` directly only for a new kind of row.
 */
const meta = {
  title: "Display/FloatingBadge",
  component: FloatingBadge,
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, iframeHeight: 360 },
      description: {
        component:
          "Portalled glass pills: `href` → link, `onClick` → toggle button, `status` → `<output>`. `accentColor` tints `accented` pills only.",
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

const LINK: FloatingBadgeAction = {
  ariaLabel: "preview — open external preview",
  label: "preview",
  glyph: "↗",
  href: "https://example.com",
  accented: true,
};

const STATUS: FloatingBadgeAction = {
  ariaLabel: "Draft preview — unpublished content",
  label: "draft",
  glyph: "🔍",
  status: true,
};

const TOGGLE: FloatingBadgeAction = {
  ariaLabel: "12-column overlay",
  label: "grid",
  glyph: "⊞",
  pressed: true,
  onClick: () => {},
};

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
  render: (args) => (
    <Stage>
      <FloatingBadge {...args} actions={[LINK]} />
    </Stage>
  ),
};

export const Mixed: Story = {
  render: (args) => (
    <Stage>
      <FloatingBadge {...args} actions={[LINK, STATUS, TOGGLE]} />
    </Stage>
  ),
};

/** Only the accented pill takes the accent; the rest stay on the default glass. */
export const WorkAccent: Story = {
  args: {
    accentColor: "#EC6839",
  },
  render: (args) => (
    <Stage>
      <FloatingBadge {...args} actions={[LINK, STATUS, TOGGLE]} />
    </Stage>
  ),
};
