import { Box, Icon } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Icon component stories
 *
 * Centralized icon system with SVG icons. All icons are scalable
 * and inherit the current text color.
 */
const meta = {
  title: "UI/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "select",
      options: ["arrow-up", "arrow-down", "arrow-left", "arrow-right"],
      description: "Icon name",
    },
    size: {
      control: "text",
      description: "Icon size (width/height)",
      table: {
        defaultValue: { summary: "32px" },
      },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default arrow up icon
 */
export const Default: Story = {
  args: {
    name: "arrow-up",
    size: "32px",
  },
};

/**
 * Arrow down
 */
export const ArrowDown: Story = {
  args: {
    name: "arrow-down",
    size: "32px",
  },
};

/**
 * Arrow left
 */
export const ArrowLeft: Story = {
  args: {
    name: "arrow-left",
    size: "32px",
  },
};

/**
 * Arrow right
 */
export const ArrowRight: Story = {
  args: {
    name: "arrow-right",
    size: "32px",
  },
};

/**
 * Large size (96px)
 */
export const Large: Story = {
  args: {
    name: "arrow-up",
    size: "96px",
  },
};

/**
 * Small size (16px)
 */
export const Small: Story = {
  args: {
    name: "arrow-up",
    size: "16px",
  },
};

/**
 * With custom color
 */
export const CustomColor: Story = {
  args: {
    name: "arrow-up",
    size: "48px",
  },
  render: (args) => <Icon {...args} css={{ color: "primary.500" }} />,
};

/**
 * Rotated (90deg for horizontal arrow)
 */
export const Rotated: Story = {
  args: {
    name: "arrow-up",
    size: "48px",
  },
  render: (args) => <Icon {...args} css={{ transform: "rotate(90deg)" }} />,
};

/**
 * All icons overview
 */
export const AllIcons: Story = {
  render: () => (
    <Box
      css={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "32px",
        p: "32px",
      }}
    >
      <Box css={{ textAlign: "center" }}>
        <Icon name="arrow-up" size="48px" />
        <Box css={{ mt: "8px", fontSize: "sm" }}>arrow-up</Box>
      </Box>
      <Box css={{ textAlign: "center" }}>
        <Icon name="arrow-down" size="48px" />
        <Box css={{ mt: "8px", fontSize: "sm" }}>arrow-down</Box>
      </Box>
      <Box css={{ textAlign: "center" }}>
        <Icon name="arrow-left" size="48px" />
        <Box css={{ mt: "8px", fontSize: "sm" }}>arrow-left</Box>
      </Box>
      <Box css={{ textAlign: "center" }}>
        <Icon name="arrow-right" size="48px" />
        <Box css={{ mt: "8px", fontSize: "sm" }}>arrow-right</Box>
      </Box>
    </Box>
  ),
};

/**
 * Rotations demonstration
 */
export const Rotations: Story = {
  render: () => (
    <Box
      css={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "32px",
        p: "32px",
      }}
    >
      <Box css={{ textAlign: "center" }}>
        <Icon name="arrow-up" size="48px" css={{ transform: "rotate(0deg)" }} />
        <Box css={{ mt: "8px", fontSize: "sm" }}>0° (up)</Box>
      </Box>
      <Box css={{ textAlign: "center" }}>
        <Icon
          name="arrow-up"
          size="48px"
          css={{ transform: "rotate(90deg)" }}
        />
        <Box css={{ mt: "8px", fontSize: "sm" }}>90° (right)</Box>
      </Box>
      <Box css={{ textAlign: "center" }}>
        <Icon
          name="arrow-up"
          size="48px"
          css={{ transform: "rotate(180deg)" }}
        />
        <Box css={{ mt: "8px", fontSize: "sm" }}>180° (down)</Box>
      </Box>
      <Box css={{ textAlign: "center" }}>
        <Icon
          name="arrow-up"
          size="48px"
          css={{ transform: "rotate(-90deg)" }}
        />
        <Box css={{ mt: "8px", fontSize: "sm" }}>-90° (left)</Box>
      </Box>
    </Box>
  ),
};
