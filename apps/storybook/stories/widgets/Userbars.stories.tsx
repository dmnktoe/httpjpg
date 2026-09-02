import { Box, Userbars } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

function userbarSrc(label: string, from: string, to: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="350" height="19" viewBox="0 0 350 19"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="350" height="19" fill="url(#g)" stroke="#000" stroke-width="1"/><rect width="350" height="9" fill="#fff" fill-opacity=".28"/><text x="10" y="14" fill="#fff" font-family="monospace" font-size="10" font-weight="700" stroke="#000" stroke-width="0.6" paint-order="stroke">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const ITEMS = [
  {
    src: userbarSrc(".WAV AUDIO FORMAT USER", "#c8c8c8", "#1a4a9e"),
    alt: ".WAV AUDIO FORMAT USER",
  },
  {
    src: userbarSrc("MAC OS X USER", "#9aa3ad", "#3b82f6"),
    alt: "Mac OS X user",
    href: "https://example.com/mac",
  },
  { src: userbarSrc("POWERED BY NEXT.JS", "#111111", "#f97316"), alt: "Powered by Next.js" },
];

/**
 * Classic 350×19 forum userbars, stacked at native size and unsmoothed.
 * An `href` wraps a bar; `javascript:` and other unsafe schemes are dropped.
 */
const meta = {
  title: "Widgets/Userbars",
  component: Userbars,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { items: ITEMS },
} satisfies Meta<typeof Userbars>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Classic 350×19 forum userbars, stacked at native size. */
export const Playground: Story = {};

/** How the stack reads in the footer, below the wave divider. */
export const InFooter: Story = {
  render: (args) => (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        w: "26rem",
        p: "4",
        border: "1px dashed",
        borderColor: "pageBorder",
      }}
    >
      <Userbars {...args} />
    </Box>
  ),
};
