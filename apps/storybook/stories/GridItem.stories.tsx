import { Box, Grid, GridItem, Headline, Image, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { OPTIMIZED_IMAGES } from "./storybook-fixtures";

/**
 * GridItem component stories
 *
 * GridItem provides precise control over positioning and spanning within Grid layouts.
 * Perfect for creating complex magazine-style layouts with overlapping elements.
 */
const meta = {
  title: "Layout/GridItem",
  component: GridItem,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    colSpan: {
      control: { type: "select" },
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, "full"],
      description: "Number of columns to span",
      table: {
        defaultValue: { summary: "1" },
      },
    },
    rowSpan: {
      control: { type: "number", min: 1, max: 6 },
      description: "Number of rows to span",
      table: {
        defaultValue: { summary: "1" },
      },
    },
    colStart: {
      control: { type: "number", min: 1, max: 12 },
      description: "Column start position",
    },
    colEnd: {
      control: { type: "number", min: 2, max: 13 },
      description: "Column end position",
    },
  },
} satisfies Meta<typeof GridItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic GridItem with column spanning
 */
export const Basic: Story = {
  args: {
    colSpan: 6,
    rowSpan: 1,
    children: null,
  },
  render: (args) => (
    <Grid columns={12} gap={4} css={{ bg: "neutral.50", p: "8" }}>
      <GridItem colSpan={args.colSpan} rowSpan={args.rowSpan}>
        <Box css={{ bg: "blue.500", color: "white", p: "8", h: "full" }}>
          <Headline level={3} css={{ m: 0, color: "white" }}>
            GridItem
          </Headline>
          <Paragraph css={{ mt: "2", color: "white", opacity: 0.9 }}>
            colSpan: {args.colSpan} | rowSpan: {args.rowSpan}
          </Paragraph>
        </Box>
      </GridItem>
      {/* Fill rest of grid */}
      <GridItem colSpan={6}>
        <Box css={{ bg: "neutral.200", p: "4", h: "120px" }}>Other item</Box>
      </GridItem>
      <GridItem colSpan={6}>
        <Box css={{ bg: "neutral.200", p: "4", h: "120px" }}>Other item</Box>
      </GridItem>
      <GridItem colSpan={6}>
        <Box css={{ bg: "neutral.200", p: "4", h: "120px" }}>Other item</Box>
      </GridItem>
    </Grid>
  ),
};

/**
 * Full width GridItem
 */
export const FullWidth: Story = {
  args: {
    colSpan: "full",
    children: (
      <Box
        css={{ bg: "purple.500", color: "white", p: "8", textAlign: "center" }}
      >
        <Headline level={2} css={{ m: 0, color: "white" }}>
          🎀 ୧ꔛꗃ˖ Full Width GridItem
        </Headline>
        <Paragraph css={{ mt: "4", color: "white" }}>
          ⋆.˚ Spans all 12 columns ･ﾟ⋆
        </Paragraph>
      </Box>
    ),
  },
  render: (args) => (
    <Grid columns={12} gap={4} css={{ bg: "neutral.50", p: "8" }}>
      <GridItem colSpan={4}>
        <Box css={{ bg: "neutral.200", p: "4", h: "100px" }}>4 cols</Box>
      </GridItem>
      <GridItem colSpan={4}>
        <Box css={{ bg: "neutral.200", p: "4", h: "100px" }}>4 cols</Box>
      </GridItem>
      <GridItem colSpan={4}>
        <Box css={{ bg: "neutral.200", p: "4", h: "100px" }}>4 cols</Box>
      </GridItem>
      <GridItem {...args} />
    </Grid>
  ),
};

/**
 * Precise positioning with colStart and colEnd
 */
export const PrecisePositioning: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Grid columns={12} gap={4} css={{ bg: "neutral.50", p: "8" }}>
      {/* Row 1 */}
      <GridItem colStart={1} colEnd={4}>
        <Box css={{ bg: "blue.500", color: "white", p: "4", h: "100px" }}>
          1 → 4
        </Box>
      </GridItem>
      <GridItem colStart={5} colEnd={9}>
        <Box css={{ bg: "red.500", color: "white", p: "4", h: "100px" }}>
          5 → 9
        </Box>
      </GridItem>
      <GridItem colStart={10} colEnd={13}>
        <Box css={{ bg: "green.500", color: "white", p: "4", h: "100px" }}>
          10 → 13
        </Box>
      </GridItem>

      {/* Row 2 - Offset positioning */}
      <GridItem colStart={3} colEnd={7}>
        <Box css={{ bg: "purple.500", color: "white", p: "4", h: "100px" }}>
          3 → 7
        </Box>
      </GridItem>
      <GridItem colStart={8} colEnd={12}>
        <Box css={{ bg: "orange.500", color: "white", p: "4", h: "100px" }}>
          8 → 12
        </Box>
      </GridItem>
    </Grid>
  ),
};

/**
 * Overlapping GridItems with z-index
 */
export const Overlapping: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Grid
      columns={12}
      gap={0}
      css={{ bg: "white", p: "8", position: "relative" }}
    >
      {/* Base image */}
      <GridItem colSpan={8} colStart={1} rowSpan={2}>
        <Image
          src={OPTIMIZED_IMAGES.videoStill1}
          alt="Base"
          aspectRatio="16/9"
        />
      </GridItem>

      {/* Overlapping card */}
      <GridItem colStart={6} colEnd={12} rowStart={2}>
        <Box
          css={{
            bg: "white",
            p: "8",
            position: "relative",
            zIndex: 10,
            mt: "-16",
          }}
        >
          <Box
            css={{
              fontSize: "xs",
              mb: "4",
              opacity: 0.5,
              letterSpacing: "0.15em",
            }}
          >
            ⇝ᵣₑcꫀₙₜ / 2025
          </Box>
          <Headline level={2} css={{ fontSize: "2rem", m: 0 }}>
            🎀 ୧ꔛꗃ˖ Overlapping Layout
          </Headline>
          <Paragraph css={{ mt: "4", fontSize: "sm" }}>
            ⋆.˚ ᡣ𐭩 GridItems can overlap using colStart/colEnd positioning ･ﾟ⋆
          </Paragraph>
        </Box>
      </GridItem>
    </Grid>
  ),
};

/**
 * Magazine-style asymmetric layout
 */
export const MagazineLayout: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Grid columns={12} gap={6} css={{ bg: "white", p: "16 8" }}>
      {/* Container für eingerückte Bildreihe */}
      <GridItem colSpan={10} colStart={2}>
        <Grid columns={7} gap={6}>
          {/* Large feature - spans multiple rows */}
          <GridItem colSpan={4} rowSpan={3}>
            <Image
              src={OPTIMIZED_IMAGES.portrait}
              alt="Feature"
              aspectRatio="3/4"
            />
          </GridItem>

          {/* Title block */}
          <GridItem colSpan={3}>
            <Box css={{ p: "4" }}>
              <Box
                css={{
                  fontSize: "xs",
                  mb: "4",
                  opacity: 0.5,
                  letterSpacing: "0.15em",
                }}
              >
                ⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S
              </Box>
              <Headline level={2} css={{ fontSize: "2rem", m: 0 }}>
                ⋆.˚ ᡣ𐭩 Magazine Grid
              </Headline>
            </Box>
          </GridItem>

          {/* Small image */}
          <GridItem colSpan={3} rowSpan={2}>
            <Image
              src={OPTIMIZED_IMAGES.videoStill2}
              alt="Detail"
              aspectRatio="1/1"
            />
          </GridItem>

          {/* Text block */}
          <GridItem colSpan={3}>
            <Paragraph css={{ fontSize: "sm", lineHeight: 2, opacity: 0.7 }}>
              🎀 ୧ꔛꗃ˖ GridItem allows precise control over column spans and
              positioning ･ﾟ⋆
            </Paragraph>
          </GridItem>
        </Grid>
      </GridItem>

      {/* Wide image - full width */}
      <GridItem colSpan="full">
        <Image
          src={OPTIMIZED_IMAGES.videoStill3}
          alt="Wide"
          aspectRatio="21/9"
        />
      </GridItem>
    </Grid>
  ),
};

/**
 * Dashboard-style grid with varying sizes
 */
export const Dashboard: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Grid columns={12} gap={4} css={{ bg: "neutral.50", p: "8" }}>
      {/* Large stat */}
      <GridItem colSpan={8} rowSpan={2}>
        <Box css={{ bg: "blue.500", color: "white", p: "8", h: "full" }}>
          <Box css={{ fontSize: "xs", mb: "2", opacity: 0.8 }}>TOTAL VIEWS</Box>
          <Box css={{ fontSize: "4xl", fontWeight: "bold" }}>127.5K</Box>
          <Box css={{ fontSize: "sm", mt: "2", opacity: 0.8 }}>
            +12.5% from last month
          </Box>
        </Box>
      </GridItem>

      {/* Small stats */}
      <GridItem colSpan={4}>
        <Box css={{ bg: "green.500", color: "white", p: "6", h: "full" }}>
          <Box css={{ fontSize: "xs", mb: "2", opacity: 0.8 }}>ENGAGEMENT</Box>
          <Box css={{ fontSize: "2xl", fontWeight: "bold" }}>89.2%</Box>
        </Box>
      </GridItem>
      <GridItem colSpan={4}>
        <Box css={{ bg: "purple.500", color: "white", p: "6", h: "full" }}>
          <Box css={{ fontSize: "xs", mb: "2", opacity: 0.8 }}>BOUNCE RATE</Box>
          <Box css={{ fontSize: "2xl", fontWeight: "bold" }}>23.1%</Box>
        </Box>
      </GridItem>

      {/* Medium cards */}
      <GridItem colSpan={6}>
        <Box
          css={{
            bg: "white",
            p: "6",
            border: "1px solid",
            borderColor: "neutral.200",
          }}
        >
          <Headline level={3} css={{ m: 0, mb: "4" }}>
            ⋆.˚ Recent Activity
          </Headline>
          <Paragraph size="sm">Latest updates and changes...</Paragraph>
        </Box>
      </GridItem>
      <GridItem colSpan={6}>
        <Box
          css={{
            bg: "white",
            p: "6",
            border: "1px solid",
            borderColor: "neutral.200",
          }}
        >
          <Headline level={3} css={{ m: 0, mb: "4" }}>
            🎀 Quick Actions
          </Headline>
          <Paragraph size="sm">Common tasks and shortcuts...</Paragraph>
        </Box>
      </GridItem>
    </Grid>
  ),
};
