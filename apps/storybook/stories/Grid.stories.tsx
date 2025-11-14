import { Box, Grid, GridItem, Headline, Image, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import {
  alignArgType,
  GRID_COLUMN_OPTIONS,
  GRID_FLOW_OPTIONS,
  justifyArgType,
  spacingArgType,
} from "./storybook-helpers";

/**
 * Grid component stories
 *
 * A powerful 12-column grid system perfect for magazine-style brutalist layouts.
 * Use with GridItem for precise control over positioning and spanning.
 */
const meta = {
  title: "Layout/Grid",
  component: Grid,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    columns: {
      control: { type: "select" as const },
      options: GRID_COLUMN_OPTIONS,
      description: "Number of columns in the grid",
      table: {
        defaultValue: { summary: "12" },
      },
    },
    gap: spacingArgType("Gap between grid items (using spacing tokens)", "4"),
    align: alignArgType("Alignment of items", "stretch"),
    justify: justifyArgType("Justification of items", "start"),
    flow: {
      control: { type: "select" as const },
      options: GRID_FLOW_OPTIONS,
      description: "Auto-flow direction",
      table: {
        defaultValue: { summary: "row" },
      },
    },
    fullWidth: {
      control: "boolean",
      description: "Full width",
      table: {
        defaultValue: { summary: "false" },
      },
    },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic grid with live controls
 */
export const Basic: Story = {
  args: {
    columns: "auto",
    gap: 6,
    align: "stretch",
    justify: "start",
    flow: "row",
    fullWidth: false,
    children: null,
  },
  render: (args) => (
    <Box css={{ minH: "600px", bg: "neutral.50", p: "8" }}>
      <Grid
        columns={args.columns}
        gap={args.gap}
        align={args.align}
        justify={args.justify}
        flow={args.flow}
        fullWidth={args.fullWidth}
        css={{ minH: "500px" }}
      >
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)"
          alt="Video still 1"
          aspectRatio="4/3"
        />
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)"
          alt="Video still 2"
          aspectRatio="4/3"
        />
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)"
          alt="Video still 3"
          aspectRatio="4/3"
        />
        <Image
          src="https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg/m/2000x1125/smart/filters:quality(75)"
          alt="Klosterkirche"
          aspectRatio="4/3"
        />
        <Image
          src="https://a.storyblok.com/f/281211/1500x2000/e04c56fe25/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0225.jpg/m/2000x1125/smart/filters:quality(75)"
          alt="Klosterkirche 2"
          aspectRatio="4/3"
        />
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)"
          alt="Video still 1"
          aspectRatio="4/3"
        />
      </Grid>
    </Box>
  ),
};

/**
 * Magazine-style 12-column grid - Editorial Artsy Portfolio
 */
export const MagazineLayout: Story = {
  args: {
    children: null,
    columns: 12,
    gap: 0,
  },
  render: (args) => (
    <Grid {...args} css={{ bg: "white", p: "32 16" }}>
      {/* Hero Image - Breathe */}
      <GridItem colSpan={8} colStart={3}>
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)"
          alt="Hero"
          aspectRatio="16/9"
        />
      </GridItem>

      {/* Title - Generous spacing */}
      <GridItem colSpan={6} colStart={4}>
        <Box css={{ mt: "40", mb: "40" }}>
          <Box
            css={{
              fontSize: "xs",
              mb: "6",
              opacity: 0.5,
              letterSpacing: "0.15em",
            }}
          >
            ⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S
          </Box>
          <Headline
            level={2}
            css={{ fontSize: "3rem", lineHeight: 1.1, fontWeight: 700 }}
          >
            ⋆.˚ ᡣ𐭩 Creative Direction
          </Headline>
        </Box>
      </GridItem>

      {/* Large Portrait Left */}
      <GridItem colSpan={5} colStart={2}>
        <Box css={{ mt: "20" }}>
          <Image
            src="https://a.storyblok.com/f/281211/1500x2000/e04c56fe25/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0225.jpg/m/2000x1125/smart/filters:quality(75)"
            alt="Portrait"
            aspectRatio="3/4"
          />
        </Box>
      </GridItem>

      {/* Small Square Top Right */}
      <GridItem colSpan={3} colStart={9}>
        <Box css={{ mt: "48" }}>
          <Image
            src="https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)"
            alt="Detail"
            aspectRatio="1/1"
          />
        </Box>
      </GridItem>

      {/* Text Block Float */}
      <GridItem colSpan={3} colStart={9}>
        <Box css={{ mt: "20", pr: "8" }}>
          <Paragraph css={{ fontSize: "sm", lineHeight: 2, opacity: 0.7 }}>
            🎀 ୧ꔛꗃ˖ Embracing the space between elements creates rhythm and
            allows each piece to breathe ･ﾟ⋆
          </Paragraph>
        </Box>
      </GridItem>

      {/* Wide Image Center */}
      <GridItem colSpan={10} colStart={2}>
        <Box css={{ mt: "64", mb: "64" }}>
          <Image
            src="https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)"
            alt="Wide"
            aspectRatio="21/9"
          />
        </Box>
      </GridItem>

      {/* Quote - Minimal */}
      <GridItem colSpan={6} colStart={4}>
        <Box css={{ mb: "56" }}>
          <Headline
            level={3}
            css={{
              fontSize: "2rem",
              lineHeight: 1.3,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            ⋆.˚ "Less, but better" ⋆.˚✮
          </Headline>
        </Box>
      </GridItem>

      {/* Two Images Offset */}
      <GridItem colSpan={4} colStart={2}>
        <Image
          src="https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg/m/2000x1125/smart/filters:quality(75)"
          alt="Left"
          aspectRatio="4/5"
        />
      </GridItem>

      <GridItem colSpan={4} colStart={8}>
        <Box css={{ mt: "32" }}>
          <Image
            src="https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)"
            alt="Right"
            aspectRatio="4/5"
          />
        </Box>
      </GridItem>

      {/* Small Detail Right */}
      <GridItem colSpan={3} colStart={9}>
        <Box css={{ mt: "48" }}>
          <Image
            src="https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)"
            alt="Small detail"
            aspectRatio="4/3"
          />
        </Box>
      </GridItem>

      {/* Closing Image Full Bleed */}
      <GridItem colSpan={12}>
        <Box css={{ mt: "80" }}>
          <Image
            src="https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)"
            alt="Closing"
            aspectRatio="16/9"
          />
        </Box>
      </GridItem>

      {/* Footer Details */}
      <GridItem colSpan={8} colStart={3}>
        <Box css={{ mt: "40", mb: "20", textAlign: "center" }}>
          <Box
            css={{
              fontSize: "xs",
              mb: "4",
              opacity: 0.5,
              letterSpacing: "0.15em",
            }}
          >
            ꀷꏂ꓄ꋬꂑ꒒ꌗ
          </Box>
          <Box css={{ fontSize: "sm", lineHeight: 2, opacity: 0.7 }}>
            httpjpg × 2025 × Digital Portfolio
          </Box>
        </Box>
      </GridItem>

      {/* Wide Image - Bottom */}
      <GridItem colSpan={9} colStart={2} css={{ mt: "24", mb: "16" }}>
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)"
          alt="Wide Shot"
          aspectRatio="21/9"
        />
      </GridItem>
    </Grid>
  ),
};

/**
 * Brutalist overlapping layout - Magazine-inspired with layers
 */
export const OverlappingLayout: Story = {
  args: {
    children: null,
    columns: 12,
    gap: 6,
  },
  render: (args) => (
    <Grid {...args} css={{ p: "16 8", bg: "white" }}>
      {/* Large Hero Image with Text Overlay */}
      <GridItem colSpan={11} colStart={1}>
        <Box css={{ position: "relative" }}>
          <Image
            src="https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)"
            alt="Architecture hero"
            aspectRatio="21/9"
          />
          {/* Overlapping Title Card */}
          <Box
            css={{
              position: "absolute",
              bottom: "-12",
              right: "8",
              bg: "white",
              p: "8 12",
              border: "4px solid black",
              boxShadow: "12px 12px 0 black",
              maxW: "500px",
            }}
          >
            <Box
              css={{
                fontFamily: "mono",
                fontSize: "xs",
                mb: "2",
                opacity: 0.5,
              }}
            >
              PORTFOLIO / 2025
            </Box>
            <Headline
              level={1}
              css={{ fontSize: "2.5rem", m: 0, lineHeight: 1.1 }}
            >
              VISUAL IMPACT
            </Headline>
          </Box>
        </Box>
      </GridItem>

      {/* Description Block */}
      <GridItem colSpan={5} colStart={2} css={{ mt: "24", pr: "8" }}>
        <Paragraph size="sm">
          Overlapping elements create depth and visual hierarchy. Strategic
          layering draws attention to key content.
        </Paragraph>
      </GridItem>

      {/* Square Image 1 */}
      <GridItem colSpan={4} colStart={2} css={{ mt: "16" }}>
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)"
          alt="Minimal detail"
          aspectRatio="1/1"
        />
      </GridItem>

      {/* Square Image 2 - Overlapping */}
      <GridItem colSpan={5} colStart={6} css={{ mt: "8" }}>
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)"
          alt="Urban structure"
          aspectRatio="1/1"
        />
      </GridItem>

      {/* Floating Text Box */}
      <GridItem colSpan={4} colStart={8}>
        <Box
          css={{
            mt: "-16",
            bg: "#171717",
            color: "white",
            p: "8",
            position: "relative",
            zIndex: 10,
          }}
        >
          <Box
            css={{ fontFamily: "mono", fontSize: "xs", mb: "4", opacity: 0.7 }}
          >
            DETAILS
          </Box>
          <Box css={{ fontSize: "sm", lineHeight: 2 }}>
            Client: Studio XYZ
            <br />
            Year: 2025
            <br />
            Type: Editorial
          </Box>
        </Box>
      </GridItem>

      {/* Wide Bottom Image */}
      <GridItem colSpan={10} colStart={2}>
        <Box style={{ marginTop: "4rem" }}>
          <Image
            src="https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg/m/2000x1125/smart/filters:quality(75)"
            alt="Wide perspective"
            aspectRatio="16/9"
          />
        </Box>
      </GridItem>
    </Grid>
  ),
};

/**
 * Auto-fit responsive grid - Gallery with real images
 */
export const AutoFit: Story = {
  args: {
    children: null,
    columns: "auto",
    gap: 6,
  },
  render: (args) => (
    <Grid {...args} css={{ p: "8" }}>
      {[
        "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)",
        "https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)",
        "https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)",
        "https://a.storyblok.com/f/281211/2000x1500/bff231d512/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0215.jpg/m/2000x1125/smart/filters:quality(75)",
        "https://a.storyblok.com/f/281211/1500x2000/e04c56fe25/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0225.jpg/m/2000x1125/smart/filters:quality(75)",
        "https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)",
      ].map((src, i) => (
        <Box key={i}>
          <Image src={src} alt={`Gallery item ${i + 1}`} aspectRatio="1/1" />
        </Box>
      ))}
    </Grid>
  ),
};

/**
 * Complex grid with various spans - Minimalist Editorial
 */
export const ComplexGrid: Story = {
  args: {
    children: null,
    columns: 12,
    gap: 6,
  },
  render: (args) => (
    <Grid {...args} css={{ p: "8", bg: "white" }}>
      {/* Large Feature Image */}
      <GridItem colSpan={7} colStart={1} rowSpan={2}>
        <Image
          src="https://a.storyblok.com/f/281211/1500x2000/e04c56fe25/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0225.jpg/m/2000x1125/smart/filters:quality(75)"
          alt="Feature"
          aspectRatio="3/4"
          style={{ filter: "grayscale(100%)" }}
        />
      </GridItem>

      {/* Title Block */}
      <GridItem colSpan={5} colStart={8}>
        <Box style={{ padding: "2rem", borderLeft: "4px solid black" }}>
          <Box
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              marginBottom: "1rem",
              opacity: 0.5,
            }}
          >
            EDITORIAL / 2025
          </Box>
          <Headline level={2} style={{ fontSize: "2rem", lineHeight: 1.2 }}>
            Asymmetric Layouts
          </Headline>
          <Paragraph style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
            Complex grids enable sophisticated editorial designs with varying
            column spans.
          </Paragraph>
        </Box>
      </GridItem>

      {/* Small Images */}
      <GridItem colSpan={5} colStart={8}>
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)"
          alt="Detail 1"
          aspectRatio="16/9"
        />
      </GridItem>

      {/* Wide Image */}
      <GridItem colSpan="full">
        <Box style={{ marginTop: "2rem" }}>
          <Image
            src="https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)"
            alt="Wide"
            aspectRatio="21/9"
          />
        </Box>
      </GridItem>
    </Grid>
  ),
};
