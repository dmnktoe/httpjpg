import {
  Box,
  FooterStatusLine,
  FooterStatusLineSeparator,
  FooterStatusLineText,
  FooterStatusLineThumb,
} from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { OPTIMIZED_IMAGES } from "../shared/storybook-fixtures";

/**
 * One line of the footer's live status stack (Discord, Discogs, Letterboxd,
 * X, PSN, Schalke 04, Cloudflare). Every widget renders through this so the stack keeps
 * one rhythm.
 */
const meta = {
  title: "Widgets/FooterStatusLine",
  component: FooterStatusLine,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "discogs",
    children: <FooterStatusLineText>DJ Shadow — Endtroducing.....</FooterStatusLineText>,
  },
  argTypes: {
    label: { control: "text" },
    href: { control: "text" },
    loading: { control: "boolean" },
    onClick: {
      action: "click",
      description: "Outbound analytics hook when the line is a link",
    },
  },
} satisfies Meta<typeof FooterStatusLine>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * One line of the footer's live status stack. The label sits at the lowest
 * opacity, the title at the highest, incidental detail in between — so the eye
 * lands on what changed rather than on the source name.
 */
export const Playground: Story = {};

/** Held while the request is in flight, so the footer does not jump when data lands. */
export const Loading: Story = {
  args: { loading: true },
};

/** Without a label the line starts straight into its content, as the trophy widget does. */
export const Unlabelled: Story = {
  args: {
    label: undefined,
    children: <FooterStatusLineText>Platinum · Bloodborne</FooterStatusLineText>,
  },
};

/** Given an href the whole line becomes one external link to the item it describes. */
export const AsLink: Story = {
  args: { href: "https://www.discogs.com/release/1", label: "discogs" },
};

/** A long title truncates rather than wrapping the footer onto a second row. */
export const TruncatedTitle: Story = {
  args: {
    label: "letterboxd",
    children: (
      <FooterStatusLineText>
        The Assassination of Jesse James by the Coward Robert Ford
      </FooterStatusLineText>
    ),
  },
};

/** The shapes the thumb takes across the stack: sleeve, poster and avatar. */
export const WithThumbnails: Story = {
  render: () => (
    <Box css={{ display: "flex", flexDirection: "column", alignItems: "center", w: "26rem" }}>
      <FooterStatusLine label="discogs">
        <FooterStatusLineThumb src={OPTIMIZED_IMAGES.outletStore1} aspect="auto" />
        <FooterStatusLineText maxWidth="240px">DJ Shadow — Endtroducing.....</FooterStatusLineText>
        <FooterStatusLineText fixed dim>
          1996
        </FooterStatusLineText>
        <FooterStatusLineSeparator />
        <FooterStatusLineText fixed dim>
          Vinyl
        </FooterStatusLineText>
      </FooterStatusLine>
      <FooterStatusLine label="letterboxd">
        <FooterStatusLineThumb src={OPTIMIZED_IMAGES.portrait} aspect="auto" />
        <FooterStatusLineText>Stalker</FooterStatusLineText>
        <FooterStatusLineText fixed dim>
          1979
        </FooterStatusLineText>
        <FooterStatusLineSeparator />
        <FooterStatusLineText fixed>★★★★½</FooterStatusLineText>
      </FooterStatusLine>
      <FooterStatusLine label="x">
        <FooterStatusLineThumb src={OPTIMIZED_IMAGES.landscape} shape="circle" />
        <FooterStatusLineText maxWidth="260px">
          still thinking about that one build step
        </FooterStatusLineText>
      </FooterStatusLine>
    </Box>
  ),
};

export const Football: Story = {
  render: () => (
    <Box css={{ display: "flex", flexDirection: "column", alignItems: "center", w: "26rem" }}>
      <FooterStatusLine label="s04">
        <FooterStatusLineThumb
          src="/images/football/loss.png"
          alt="loss"
          size="2"
          shape="square"
          fit="contain"
          pixelated
        />
        <FooterStatusLineText>Hoffenheim 2:1 S04</FooterStatusLineText>
        <FooterStatusLineSeparator />
        <FooterStatusLineThumb
          src="/images/football/down.png"
          alt="down"
          size="2"
          shape="square"
          fit="contain"
          pixelated
        />
        <FooterStatusLineText fixed>17.</FooterStatusLineText>
        <FooterStatusLineText fixed dim>
          6 pts
        </FooterStatusLineText>
      </FooterStatusLine>
      <FooterStatusLine label="s04">
        <FooterStatusLineThumb
          src="/images/football/win.png"
          alt="win"
          size="2"
          shape="square"
          fit="contain"
          pixelated
        />
        <FooterStatusLineText>S04 2:0 Köln</FooterStatusLineText>
        <FooterStatusLineSeparator />
        <FooterStatusLineThumb
          src="/images/football/up.png"
          alt="up"
          size="2"
          shape="square"
          fit="contain"
          pixelated
        />
        <FooterStatusLineText fixed>9.</FooterStatusLineText>
        <FooterStatusLineText fixed dim>
          17 pts
        </FooterStatusLineText>
      </FooterStatusLine>
      <FooterStatusLine label="s04">
        <FooterStatusLineThumb
          src="/images/football/draw.png"
          alt="draw"
          size="2"
          shape="square"
          fit="contain"
          pixelated
        />
        <FooterStatusLineText>Köln 0:0 S04</FooterStatusLineText>
        <FooterStatusLineSeparator />
        <FooterStatusLineThumb
          src="/images/football/same.png"
          alt="same"
          size="2"
          shape="square"
          fit="contain"
          pixelated
        />
        <FooterStatusLineText fixed>15.</FooterStatusLineText>
        <FooterStatusLineText fixed dim>
          9 pts
        </FooterStatusLineText>
      </FooterStatusLine>
    </Box>
  ),
};

/** How the lines read stacked, which is the only place they actually appear. */
export const Stacked: Story = {
  render: () => (
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
      <FooterStatusLine label="discord">
        <Box as="span">🟢</Box>
        <FooterStatusLineText fixed>online</FooterStatusLineText>
        <FooterStatusLineSeparator />
        <FooterStatusLineText>Bloodborne</FooterStatusLineText>
      </FooterStatusLine>
      <FooterStatusLine label="letterboxd">
        <FooterStatusLineText>Stalker</FooterStatusLineText>
        <FooterStatusLineText fixed dim>
          1979
        </FooterStatusLineText>
      </FooterStatusLine>
      <FooterStatusLine label="discogs" loading />
      <FooterStatusLine label="x" loading />
    </Box>
  ),
};
