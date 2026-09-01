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

const hideOnMobile = { display: { base: "none", md: "block" } } as const;

/** How the live footer line reads: location, lockup, then analytics extras. */
export const AttributionLine: Story = {
  render: () => (
    <Box css={{ display: "flex", flexDirection: "column", alignItems: "center", w: "32rem" }}>
      <FooterStatusLine href="https://www.cloudflare.com">
        <FooterStatusLineText fixed dim>
          FRA
        </FooterStatusLineText>
        <FooterStatusLineSeparator />
        <FooterStatusLineText fixed dim>
          DE
        </FooterStatusLineText>
        <FooterStatusLineSeparator />
        <CloudflareLogo />
        <FooterStatusLineSeparator css={hideOnMobile} />
        <FooterStatusLineText fixed dim css={hideOnMobile}>
          1.2K blocked
        </FooterStatusLineText>
        <FooterStatusLineSeparator css={hideOnMobile} />
        <FooterStatusLineText fixed dim css={hideOnMobile}>
          92% cached
        </FooterStatusLineText>
      </FooterStatusLine>
    </Box>
  ),
};
