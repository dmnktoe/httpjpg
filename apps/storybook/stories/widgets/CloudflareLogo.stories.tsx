import { Box, CloudflareLogo, FooterStatusLine, FooterStatusLineText } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Widgets/CloudflareLogo",
  component: CloudflareLogo,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof CloudflareLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Official horizontal lockup. The wordmark inherits the page foreground. */
export const Playground: Story = {};

/** How the attribution line reads under the footer widgets. */
export const AttributionLine: Story = {
  render: () => (
    <Box css={{ display: "flex", flexDirection: "column", alignItems: "center", w: "26rem" }}>
      <FooterStatusLine href="https://www.cloudflare.com">
        <FooterStatusLineText fixed dim>
          backed & secured by
        </FooterStatusLineText>
        <CloudflareLogo />
      </FooterStatusLine>
    </Box>
  ),
};
