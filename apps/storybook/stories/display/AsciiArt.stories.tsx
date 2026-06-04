import {
  ASCII_404,
  ASCII_500,
  ASCII_DIVIDER_ARROWS,
  ASCII_DIVIDER_DOTS,
  ASCII_DIVIDER_MUSIC,
  ASCII_DIVIDER_STARS,
  ASCII_DIVIDER_WAVE,
  ASCII_GHOST,
  ASCII_OFFLINE,
  ASCII_SPARKLES,
  ASCII_TAPE,
  AsciiArt,
  Box,
  Headline,
  Paragraph,
  Stack,
} from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Display/AsciiArt",
  component: AsciiArt,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text", description: "Multi-line ASCII string" },
    label: { control: "text", description: "Plain-text label for screen readers" },
    inline: {
      control: "boolean",
      description: "Render inline (left-aligned) instead of centered block",
      table: { defaultValue: { summary: "false" } },
    },
  },
} satisfies Meta<typeof AsciiArt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    children: ASCII_404,
    label: "404 not found banner",
  },
};

export const Inline: Story = {
  args: {
    children: ASCII_SPARKLES,
    inline: true,
  },
};

export const Banners: Story = {
  args: { children: "" },
  render: () => (
    <Stack direction="vertical" gap="8">
      <Box>
        <Paragraph css={{ mb: "2", opacity: 0.5, fontFamily: "mono", fontSize: "xs" }}>
          ASCII_404
        </Paragraph>
        <AsciiArt label="404">{ASCII_404}</AsciiArt>
      </Box>
      <Box>
        <Paragraph css={{ mb: "2", opacity: 0.5, fontFamily: "mono", fontSize: "xs" }}>
          ASCII_500
        </Paragraph>
        <AsciiArt label="500">{ASCII_500}</AsciiArt>
      </Box>
      <Box>
        <Paragraph css={{ mb: "2", opacity: 0.5, fontFamily: "mono", fontSize: "xs" }}>
          ASCII_OFFLINE
        </Paragraph>
        <AsciiArt label="offline">{ASCII_OFFLINE}</AsciiArt>
      </Box>
      <Box>
        <Paragraph css={{ mb: "2", opacity: 0.5, fontFamily: "mono", fontSize: "xs" }}>
          ASCII_GHOST
        </Paragraph>
        <AsciiArt label="ghost">{ASCII_GHOST}</AsciiArt>
      </Box>
    </Stack>
  ),
};

export const Dividers: Story = {
  args: { children: "" },
  render: () => (
    <Stack direction="vertical" gap="6">
      <Headline as="h3" level={3}>
        Inline ASCII strings
      </Headline>
      {[
        ["ASCII_SPARKLES", ASCII_SPARKLES],
        ["ASCII_TAPE", ASCII_TAPE],
        ["ASCII_DIVIDER_STARS", ASCII_DIVIDER_STARS],
        ["ASCII_DIVIDER_DOTS", ASCII_DIVIDER_DOTS],
        ["ASCII_DIVIDER_WAVE", ASCII_DIVIDER_WAVE],
        ["ASCII_DIVIDER_ARROWS", ASCII_DIVIDER_ARROWS],
        ["ASCII_DIVIDER_MUSIC", ASCII_DIVIDER_MUSIC],
      ].map(([name, value]) => (
        <Box key={name}>
          <Paragraph css={{ mb: "1", opacity: 0.5, fontFamily: "mono", fontSize: "xs" }}>
            {name}
          </Paragraph>
          <AsciiArt inline label={name}>
            {value}
          </AsciiArt>
        </Box>
      ))}
    </Stack>
  ),
};
