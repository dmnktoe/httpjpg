import {
  Box,
  Grid,
  GridItem,
  Headline,
  Image,
  Paragraph,
  ScaledContainer,
} from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * ScaledContainer component stories
 *
 * Proportional scaling like Readymag or Photoshop - everything scales together
 * without layout shifts. Perfect for portfolio layouts where precise positioning matters.
 */
const meta = {
  title: "Layout/ScaledContainer",
  component: ScaledContainer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    designWidth: {
      control: { type: "number", min: 1000, max: 3000, step: 10 },
      description: "Design width in pixels",
      table: {
        defaultValue: { summary: "1920" },
      },
    },
    designHeight: {
      control: { type: "number", min: 600, max: 2000, step: 10 },
      description: "Design height in pixels",
      table: {
        defaultValue: { summary: "1080" },
      },
    },
    minScale: {
      control: { type: "number", min: 0.1, max: 1, step: 0.1 },
      description: "Minimum scale factor",
      table: {
        defaultValue: { summary: "0.3" },
      },
    },
    maxScale: {
      control: { type: "number", min: 1, max: 3, step: 0.1 },
      description: "Maximum scale factor",
      table: {
        defaultValue: { summary: "2" },
      },
    },
    scaleMode: {
      control: { type: "select" },
      options: ["fit", "width"],
      description: "Scale mode: fit or width-based",
      table: {
        defaultValue: { summary: "fit" },
      },
    },
  },
} satisfies Meta<typeof ScaledContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic scaled layout with absolute positioning
 */
export const Basic: Story = {
  args: {
    children: null,
    designWidth: 1200,
    designHeight: 800,
    minScale: 0.3,
    maxScale: 1.5,
    scaleMode: "fit",
  },
  render: (args) => (
    <ScaledContainer {...args}>
      {/* Hero Image */}
      <Box style={{ position: "absolute", top: 100, left: 200, width: 600 }}>
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)"
          alt="Hero"
          aspectRatio="16/9"
        />
      </Box>

      {/* Title */}
      <Box style={{ position: "absolute", top: 120, left: 900, width: 800 }}>
        <Box
          style={{ fontSize: "0.75rem", marginBottom: "1rem", opacity: 0.5 }}
        >
          ⇝ᵣₑcꫀₙₜ / 2025
        </Box>
        <Headline level={1} style={{ fontSize: "4rem", lineHeight: 1.1 }}>
          🎀 ୧ꔛꗃ˖ Scaled Layout
        </Headline>
        <Paragraph style={{ marginTop: "2rem", fontSize: "1.25rem" }}>
          ⋆.˚ ᡣ𐭩 Everything scales proportionally like in Photoshop. No layout
          shifts, just pure scaling ･ﾟ⋆
        </Paragraph>
      </Box>

      {/* Small detail image */}
      <Box style={{ position: "absolute", top: 500, left: 300, width: 400 }}>
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)"
          alt="Detail"
          aspectRatio="1/1"
        />
      </Box>

      {/* Footer text */}
      <Box
        style={{
          position: "absolute",
          bottom: 100,
          left: 1520,
          textAlign: "right",
          width: 300,
        }}
      >
        <Box style={{ fontSize: "0.875rem", opacity: 0.6 }}>
          Resize the window to see proportional scaling ✨
        </Box>
      </Box>
    </ScaledContainer>
  ),
};

/**
 * Portfolio grid with scaled container
 */
export const PortfolioGrid: Story = {
  args: {
    children: null,
    designWidth: 1200,
    designHeight: 800,
    scaleMode: "fit",
  },
  render: (args) => (
    <ScaledContainer {...args} innerCss={{ bg: "white" }}>
      {/* Top left - Large image */}
      <Box style={{ position: "absolute", top: 80, left: 80, width: 700 }}>
        <Image
          src="https://a.storyblok.com/f/281211/1500x2000/e04c56fe25/2024_10_11_klosterkirche_nordshausen_time_this_wild_beast_in_the_jungle_0225.jpg/m/2000x1125/smart/filters:quality(75)"
          alt="Portfolio 1"
          aspectRatio="3/4"
        />
      </Box>

      {/* Top right - Title */}
      <Box style={{ position: "absolute", top: 120, left: 1120, width: 600 }}>
        <Box
          style={{
            fontSize: "0.75rem",
            marginBottom: "1rem",
            opacity: 0.5,
            letterSpacing: "0.15em",
          }}
        >
          ꀷꏂ꓄ꋬꂑ꒒ꌗ
        </Box>
        <Headline level={2} style={{ fontSize: "3rem", lineHeight: 1.1 }}>
          ⋆.˚ ᡣ𐭩 Creative Portfolio
        </Headline>
        <Paragraph style={{ marginTop: "1.5rem", lineHeight: 1.8 }}>
          🎀 ୧ꔛꗃ˖ A scaled container ensures pixel-perfect positioning across
          all viewport sizes ･ﾟ⋆
        </Paragraph>
      </Box>

      {/* Middle - Wide image */}
      <Box
        style={{
          position: "absolute",
          top: 480,
          left: 80,
          width: 1760,
        }}
      >
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)"
          alt="Wide shot"
          aspectRatio="21/9"
        />
      </Box>

      {/* Bottom right - Small square */}
      <Box style={{ position: "absolute", bottom: 80, left: 1490, width: 350 }}>
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)"
          alt="Detail"
          aspectRatio="1/1"
        />
      </Box>

      {/* Footer */}
      <Box
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          fontSize: "0.875rem",
          opacity: 0.5,
        }}
      >
        httpjpg × 2025 × Scaled Layout Demo
      </Box>
    </ScaledContainer>
  ),
};

/**
 * Magazine-style overlapping elements
 */
export const MagazineOverlap: Story = {
  args: {
    children: null,
    designWidth: 1920,
    designHeight: 1200,
    scaleMode: "fit",
  },
  render: (args) => (
    <ScaledContainer {...args} innerCss={{ bg: "#FAFAFA" }}>
      {/* Background image */}
      <Box style={{ position: "absolute", top: 0, left: 0, width: 1200 }}>
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)"
          alt="Background"
          aspectRatio="16/9"
        />
      </Box>

      {/* Overlapping text card */}
      <Box
        style={{
          position: "absolute",
          top: 300,
          left: 900,
          width: 700,
          backgroundColor: "white",
          padding: "4rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <Box
          style={{
            fontSize: "0.75rem",
            marginBottom: "1rem",
            opacity: 0.5,
            letterSpacing: "0.15em",
          }}
        >
          ⇝ᵣₑcꫀₙₜ TH1𝓃𝑔S
        </Box>
        <Headline level={1} style={{ fontSize: "3rem", lineHeight: 1.1 }}>
          🎀 ୧ꔛꗃ˖ VISUAL IMPACT
        </Headline>
        <Paragraph style={{ marginTop: "2rem", lineHeight: 1.8 }}>
          ⋆.˚ ᡣ𐭩 Overlapping elements create depth. Everything scales together,
          maintaining the exact spatial relationships you designed ･ﾟ⋆
        </Paragraph>
      </Box>

      {/* Small floating image */}
      <Box
        style={{
          position: "absolute",
          top: 750,
          left: 400,
          width: 500,
          zIndex: 10,
        }}
      >
        <Image
          src="https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)"
          alt="Floating"
          aspectRatio="1/1"
        />
      </Box>

      {/* Detail text */}
      <Box
        style={{
          position: "absolute",
          bottom: 100,
          left: 1320,
          width: 400,
          textAlign: "right",
        }}
      >
        <Box style={{ fontSize: "0.875rem", lineHeight: 1.8, opacity: 0.7 }}>
          ⋆.˚ Client: Studio XYZ
          <br />🎀 Year: 2025
          <br />
          ･ﾟ⋆ Type: Editorial
        </Box>
      </Box>
    </ScaledContainer>
  ),
};

/**
 * Grid inside scaled container - Hybrid approach
 */
export const ScaledGrid: Story = {
  args: {
    children: null,
    designWidth: 1920,
    designHeight: 1080,
    scaleMode: "fit",
  },
  render: (args) => (
    <ScaledContainer {...args} innerCss={{ bg: "white", p: "80px" }}>
      {/* Title at fixed position */}
      <Box style={{ position: "absolute", top: 80, left: 80, width: 600 }}>
        <Box
          style={{
            fontSize: "0.75rem",
            marginBottom: "1rem",
            opacity: 0.5,
            letterSpacing: "0.15em",
          }}
        >
          HYBRID APPROACH
        </Box>
        <Headline level={2} style={{ fontSize: "2.5rem", lineHeight: 1.1 }}>
          ⋆.˚ Grid + Scaled Container
        </Headline>
      </Box>

      {/* Grid with absolute positioning */}
      <Box style={{ position: "absolute", top: 280, left: 80, width: 1760 }}>
        <Grid columns={3} gap={6}>
          <GridItem>
            <Image
              src="https://a.storyblok.com/f/281211/5120x2880/a1811c6510/video-still-1.png/m/2000x1125/smart/filters:quality(75)"
              alt="Grid 1"
              aspectRatio="4/3"
            />
          </GridItem>
          <GridItem>
            <Image
              src="https://a.storyblok.com/f/281211/5120x2880/89c84d7bcc/video-still-2.png/m/2000x1125/smart/filters:quality(75)"
              alt="Grid 2"
              aspectRatio="4/3"
            />
          </GridItem>
          <GridItem>
            <Image
              src="https://a.storyblok.com/f/281211/5120x2880/075de8f14e/video-still-3.png/m/2000x1125/smart/filters:quality(75)"
              alt="Grid 3"
              aspectRatio="4/3"
            />
          </GridItem>
        </Grid>
      </Box>

      {/* Footer at fixed position */}
      <Box
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          fontSize: "0.875rem",
          opacity: 0.5,
        }}
      >
        🎀 Everything scales proportionally ･ﾟ⋆
      </Box>
    </ScaledContainer>
  ),
};
