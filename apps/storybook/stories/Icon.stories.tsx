import { Box, Icon, type IconName } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const ICON_NAMES: IconName[] = [
  "arrow-up",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "play",
  "pause",
  "volume",
  "volume-mute",
];

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
      options: ICON_NAMES,
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
 * Playground with live controls
 */
export const Playground: Story = {
  args: {
    name: "arrow-up",
    size: "48px",
  },
};

/**
 * All icons overview
 */
export const Overview: Story = {
  args: {
    name: "arrow-up",
  },
  parameters: {
    layout: "padded",
  },
  render: () => (
    <Box
      css={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: "24px",
      }}
    >
      {ICON_NAMES.map((iconName) => (
        <Box
          key={iconName}
          css={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            p: "16px",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "neutral.200",
            _hover: {
              bg: "neutral.50",
              borderColor: "neutral.300",
            },
          }}
        >
          <Icon name={iconName} size="48px" />
          <Box
            css={{
              fontSize: "xs",
              fontFamily: "mono",
              color: "neutral.600",
              textAlign: "center",
            }}
          >
            {iconName}
          </Box>
        </Box>
      ))}
    </Box>
  ),
};

/**
 * Different sizes
 */
export const Sizes: Story = {
  args: {
    name: "arrow-up",
  },
  parameters: {
    layout: "padded",
  },
  render: () => (
    <Box
      css={{
        display: "flex",
        alignItems: "center",
        gap: "32px",
        flexWrap: "wrap",
      }}
    >
      {["16px", "24px", "32px", "48px", "64px", "96px"].map((size) => (
        <Box
          key={size}
          css={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Icon name="arrow-up" size={size} />
          <Box
            css={{ fontSize: "xs", fontFamily: "mono", color: "neutral.600" }}
          >
            {size}
          </Box>
        </Box>
      ))}
    </Box>
  ),
};

/**
 * With colors
 */
export const Colors: Story = {
  args: {
    name: "arrow-up",
  },
  parameters: {
    layout: "padded",
  },
  render: () => (
    <Box
      css={{
        display: "flex",
        gap: "24px",
        flexWrap: "wrap",
      }}
    >
      <Icon name="arrow-up" size="48px" css={{ color: "neutral.900" }} />
      <Icon name="arrow-up" size="48px" css={{ color: "blue" }} />
      <Icon name="arrow-up" size="48px" css={{ color: "red" }} />
      <Icon name="arrow-up" size="48px" css={{ color: "green" }} />
      <Icon name="arrow-up" size="48px" css={{ color: "neutral.400" }} />
    </Box>
  ),
};

/**
 * All arrow directions
 */
export const Arrows: Story = {
  args: {
    name: "arrow-up",
  },
  parameters: {
    layout: "padded",
  },
  render: () => (
    <Box
      css={{
        display: "flex",
        gap: "48px",
        flexWrap: "wrap",
      }}
    >
      {(["arrow-up", "arrow-right", "arrow-down", "arrow-left"] as const).map(
        (iconName) => (
          <Box
            key={iconName}
            css={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Icon name={iconName} size="48px" />
            <Box
              css={{ fontSize: "xs", fontFamily: "mono", color: "neutral.600" }}
            >
              {iconName}
            </Box>
          </Box>
        ),
      )}
    </Box>
  ),
};
