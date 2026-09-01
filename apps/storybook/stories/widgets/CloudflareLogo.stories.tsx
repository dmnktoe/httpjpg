import {
  Box,
  CloudflareLogo,
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
} from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Widgets/CloudflareLogo",
  component: CloudflareLogo,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof CloudflareLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Classic glossy lockup from `public/images/footer/cloudflare_logo.png`. */
export const Playground: Story = {};

/** How the live attribution line reads under the footer widgets. */
export const AttributionLine: Story = {
  render: () => (
    <Box css={{ display: "flex", flexDirection: "column", alignItems: "center", w: "32rem" }}>
      <FooterStatusLine href="https://www.cloudflare.com">
        <FooterStatusLineText fixed dim>
          backed & secured by
        </FooterStatusLineText>
        <CloudflareLogo />
        <FooterStatusLineSeparator />
        <FooterStatusLineText fixed dim>
          FRA
        </FooterStatusLineText>
        <FooterStatusLineSeparator />
        <FooterStatusLineText fixed dim>
          DE
        </FooterStatusLineText>
        <FooterStatusLineSeparator />
        <FooterStatusLineText fixed dim>
          1.2K blocked
        </FooterStatusLineText>
        <FooterStatusLineSeparator />
        <FooterStatusLineText fixed dim>
          92% cached
        </FooterStatusLineText>
      </FooterStatusLine>
    </Box>
  ),
};
