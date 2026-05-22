import {
  Box,
  Headline,
  Icon,
  ICON_GROUPS,
  ICON_NAMES,
  type IconName,
  Paragraph,
} from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "UI/Icon",
  component: Icon,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "select",
      options: ICON_NAMES,
      description: "Icon name from the library",
    },
    size: {
      control: "text",
      description: "Any CSS length, number (px), or token value",
      table: { defaultValue: { summary: "1em" } },
    },
    strokeWidth: {
      control: { type: "range", min: 0.5, max: 4, step: 0.25 },
      description: "Override stroke width",
      table: { defaultValue: { summary: "2" } },
    },
    label: {
      control: "text",
      description: "Accessible label — when omitted, the icon is aria-hidden",
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    name: "arrow-right",
    size: "48px",
    strokeWidth: 2,
  },
};

export const Library: Story = {
  args: { name: "arrow-right" },
  parameters: { layout: "padded" },
  render: () => (
    <Box css={{ maxW: "1024px", mx: "auto" }}>
      <Headline as="h2" level={2} css={{ mb: "2" }}>
        Icon library
      </Headline>
      <Paragraph css={{ opacity: 0.7, mb: "8" }}>
        {ICON_NAMES.length} icons on a 24×24 grid. 2px stroke, <code>currentColor</code>, all paths
        normalized.
      </Paragraph>

      {ICON_GROUPS.map((group) => (
        <Box key={group.label} css={{ mb: "10" }}>
          <Box
            css={{
              fontFamily: "mono",
              fontSize: "xs",
              letterSpacing: "wider",
              textTransform: "uppercase",
              opacity: 0.5,
              mb: "3",
            }}
          >
            ── {group.label} ({group.names.length})
          </Box>
          <Box
            css={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "2",
            }}
          >
            {group.names.map((iconName) => (
              <IconTile key={iconName} name={iconName} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  ),
};

export const Sizes: Story = {
  args: { name: "arrow-up-right" },
  parameters: { layout: "padded" },
  render: () => (
    <Box
      css={{
        display: "flex",
        alignItems: "flex-end",
        gap: "8",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {["16px", "24px", "32px", "48px", "64px", "96px"].map((size) => (
        <Box
          key={size}
          css={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2" }}
        >
          <Icon name="arrow-up-right" size={size} />
          <Box css={{ fontSize: "xs", fontFamily: "mono", opacity: 0.6 }}>{size}</Box>
        </Box>
      ))}
    </Box>
  ),
};

export const StrokeWeights: Story = {
  args: { name: "search" },
  parameters: { layout: "padded" },
  render: () => (
    <Box
      css={{
        display: "flex",
        gap: "10",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {[1, 1.5, 2, 2.5, 3].map((weight) => (
        <Box
          key={weight}
          css={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2" }}
        >
          <Icon name="search" size="48px" strokeWidth={weight} />
          <Box css={{ fontSize: "xs", fontFamily: "mono", opacity: 0.6 }}>{weight}px</Box>
        </Box>
      ))}
    </Box>
  ),
};

export const Colors: Story = {
  args: { name: "heart" },
  parameters: { layout: "padded" },
  render: () => (
    <Box css={{ display: "flex", gap: "6", flexWrap: "wrap", alignItems: "center" }}>
      <Icon name="heart" size="48px" />
      <Icon name="heart" size="48px" css={{ color: "primary.500" }} />
      <Icon name="heart" size="48px" css={{ color: "secondary.500" }} />
      <Icon name="heart" size="48px" css={{ color: "accent.500" }} />
      <Icon name="heart" size="48px" css={{ color: "success.500" }} />
      <Icon name="heart" size="48px" css={{ color: "neutral.400" }} />
    </Box>
  ),
};

export const InlineWithText: Story = {
  args: { name: "arrow-up-right" },
  parameters: { layout: "padded" },
  render: () => (
    <Box css={{ maxW: "560px", mx: "auto", display: "flex", flexDirection: "column", gap: "3" }}>
      <Paragraph>
        Icons sized in <code>em</code> scale to the surrounding text. Read the docs{" "}
        <Box
          as="span"
          css={{
            display: "inline-flex",
            alignItems: "center",
            gap: "1",
            textDecoration: "underline",
          }}
        >
          here <Icon name="arrow-up-right" size="0.9em" />
        </Box>{" "}
        for more.
      </Paragraph>
      <Paragraph size="lg">
        Larger paragraph — the icon{" "}
        <Box as="span" css={{ display: "inline-flex", alignItems: "center", gap: "1" }}>
          <Icon name="check" size="1em" />
        </Box>{" "}
        scales with it.
      </Paragraph>
    </Box>
  ),
};

function IconTile({ name }: { name: IconName }) {
  return (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2",
        p: "4",
        border: "1px solid",
        borderColor: "neutral.200",
        transition: "background 120ms ease",
        _hover: { bg: "neutral.50", borderColor: "neutral.400" },
      }}
    >
      <Icon name={name} size="32px" />
      <Box
        css={{
          fontFamily: "mono",
          fontSize: "xs",
          textAlign: "center",
          opacity: 0.7,
          wordBreak: "break-word",
        }}
      >
        {name}
      </Box>
    </Box>
  );
}
