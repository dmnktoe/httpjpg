import {
  AspectRatio,
  Box,
  Grid,
  GridItem,
  Headline,
  Paragraph,
} from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

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
      control: { type: "select" },
      options: [1, 2, 3, 4, 6, 12, "auto"],
      description: "Number of columns in the grid",
      table: {
        defaultValue: { summary: "12" },
      },
    },
    gap: {
      control: { type: "select" },
      options: ["0", "1", "2", "4", "6", "8", "12", "16"],
      description: "Gap between grid items (using spacing tokens)",
      table: {
        defaultValue: { summary: "4" },
      },
    },
    align: {
      control: { type: "select" },
      options: ["start", "center", "end", "stretch"],
      description: "Alignment of items",
      table: {
        defaultValue: { summary: "stretch" },
      },
    },
    justify: {
      control: { type: "select" },
      options: ["start", "center", "end", "stretch"],
      description: "Justification of items",
      table: {
        defaultValue: { summary: "start" },
      },
    },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic grid with 3 columns - Minimalist
 */
export const Basic: Story = {
  args: {
    columns: 3,
    gap: 6,
  },
  render: (args) => (
    <Grid {...args} style={{ padding: "2rem" }}>
      <AspectRatio ratio="4/3">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop"
          alt="Architecture"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AspectRatio>
      <AspectRatio ratio="4/3">
        <img
          src="https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=800&auto=format&fit=crop"
          alt="Minimalist"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AspectRatio>
      <AspectRatio ratio="4/3">
        <img
          src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&auto=format&fit=crop"
          alt="Abstract"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AspectRatio>
    </Grid>
  ),
};

/**
 * Magazine-style 12-column grid - Minimalist Brutalist
 */
export const MagazineLayout: Story = {
  args: {
    columns: 12,
    gap: 6,
  },
  render: (args) => (
    <Grid {...args} style={{ background: "white", padding: "4rem 2rem" }}>
      {/* Hero Image - Clean & Bold */}
      <GridItem colSpan={10} colStart={2}>
        <AspectRatio ratio="21/9">
          <img
            src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1600&auto=format&fit=crop"
            alt="Hero"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(100%)",
            }}
          />
        </AspectRatio>
      </GridItem>

      {/* Project Title - Minimal with spacing */}
      <GridItem colSpan={6} colStart={4}>
        <Box style={{ marginTop: "6rem" }}>
          <Box
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              marginBottom: "1rem",
              opacity: 0.5,
            }}
          >
            01 / PROJECT
          </Box>
          <Headline level={2} style={{ fontSize: "2.5rem", lineHeight: 1.2 }}>
            Creative Direction
          </Headline>
        </Box>
      </GridItem>

      {/* Main Image - Offset */}
      <GridItem colSpan={7} colStart={2}>
        <Box style={{ marginTop: "4rem" }}>
          <AspectRatio ratio="4/3">
            <img
              src="https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=1200&auto=format&fit=crop"
              alt="Main Project"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AspectRatio>
        </Box>
      </GridItem>

      {/* Text Block - Asymmetric */}
      <GridItem colSpan={4} colStart={9}>
        <Box
          style={{
            marginTop: "8rem",
            paddingLeft: "2rem",
            borderLeft: "2px solid black",
          }}
        >
          <Paragraph style={{ fontSize: "0.875rem", lineHeight: 1.8 }}>
            Minimalist brutalism focuses on whitespace, bold typography, and
            strategic use of negative space to create visual hierarchy.
          </Paragraph>
        </Box>
      </GridItem>

      {/* Two Images - Side by Side with space */}
      <GridItem colSpan={5} colStart={3}>
        <Box style={{ marginTop: "6rem" }}>
          <AspectRatio ratio="1/1">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop"
              alt="Detail 1"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(100%) contrast(1.2)",
              }}
            />
          </AspectRatio>
        </Box>
      </GridItem>

      <GridItem colSpan={5} colStart={8}>
        <Box style={{ marginTop: "10rem" }}>
          <AspectRatio ratio="1/1">
            <img
              src="https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800&auto=format&fit=crop"
              alt="Detail 2"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                border: "2px solid black",
              }}
            />
          </AspectRatio>
        </Box>
      </GridItem>

      {/* Quote/Statement - Full width with margins */}
      <GridItem colSpan={8} colStart={3}>
        <Box
          style={{
            marginTop: "8rem",
            paddingTop: "3rem",
            paddingBottom: "3rem",
            borderTop: "1px solid #e5e5e5",
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          <Headline level={3} style={{ fontSize: "1.5rem", fontWeight: 400 }}>
            "Less is more, but impact is everything"
          </Headline>
        </Box>
      </GridItem>

      {/* Small Image - Far right */}
      <GridItem colSpan={4} colStart={9}>
        <Box style={{ marginTop: "4rem", position: "relative" }}>
          <AspectRatio ratio="16/9">
            <img
              src="https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800&auto=format&fit=crop"
              alt="Detail 3"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AspectRatio>
          <Box
            style={{
              position: "absolute",
              bottom: "1rem",
              right: "1rem",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              background: "white",
              padding: "0.25rem 0.5rem",
            }}
          >
            02
          </Box>
        </Box>
      </GridItem>

      {/* Details - Clean list */}
      <GridItem colSpan={3} colStart={2}>
        <Box style={{ marginTop: "8rem" }}>
          <Box
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              marginBottom: "1.5rem",
              opacity: 0.5,
            }}
          >
            DETAILS
          </Box>
          <Box
            style={{
              fontSize: "0.875rem",
              lineHeight: 2,
            }}
          >
            Client: Studio XYZ
            <br />
            Year: 2025
            <br />
            Type: Digital
          </Box>
        </Box>
      </GridItem>

      {/* Wide Image - Bottom */}
      <GridItem colSpan={9} colStart={2}>
        <Box style={{ marginTop: "6rem", marginBottom: "4rem" }}>
          <AspectRatio ratio="21/9">
            <img
              src="https://images.unsplash.com/photo-1618005198914-c1b89531a13e?w=1600&auto=format&fit=crop"
              alt="Wide Shot"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AspectRatio>
        </Box>
      </GridItem>
    </Grid>
  ),
};

/**
 * Brutalist overlapping layout - Magazine-inspired with layers
 */
export const OverlappingLayout: Story = {
  args: {
    columns: 12,
    gap: 6,
  },
  render: (args) => (
    <Grid {...args} style={{ padding: "4rem 2rem", background: "white" }}>
      {/* Large Hero Image with Text Overlay */}
      <GridItem colSpan={11} colStart={1}>
        <Box style={{ position: "relative" }}>
          <AspectRatio ratio="21/9">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop"
              alt="Architecture hero"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(100%)",
              }}
            />
          </AspectRatio>
          {/* Overlapping Title Card */}
          <Box
            style={{
              position: "absolute",
              bottom: "-3rem",
              right: "2rem",
              background: "white",
              padding: "2rem 3rem",
              border: "4px solid black",
              boxShadow: "12px 12px 0 black",
              maxWidth: "500px",
            }}
          >
            <Box
              style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                marginBottom: "0.5rem",
                opacity: 0.5,
              }}
            >
              PORTFOLIO / 2025
            </Box>
            <Headline
              level={1}
              style={{ fontSize: "2.5rem", margin: 0, lineHeight: 1.1 }}
            >
              VISUAL IMPACT
            </Headline>
          </Box>
        </Box>
      </GridItem>

      {/* Description Block */}
      <GridItem colSpan={5} colStart={2}>
        <Box style={{ marginTop: "6rem", paddingRight: "2rem" }}>
          <Paragraph style={{ fontSize: "0.875rem", lineHeight: 1.8 }}>
            Overlapping elements create depth and visual hierarchy. Strategic
            layering draws attention to key content.
          </Paragraph>
        </Box>
      </GridItem>

      {/* Square Image 1 */}
      <GridItem colSpan={4} colStart={2}>
        <Box style={{ marginTop: "4rem" }}>
          <AspectRatio ratio="1/1">
            <img
              src="https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=800&auto=format&fit=crop"
              alt="Minimal detail"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AspectRatio>
        </Box>
      </GridItem>

      {/* Square Image 2 - Overlapping */}
      <GridItem colSpan={5} colStart={6}>
        <Box style={{ marginTop: "2rem" }}>
          <AspectRatio ratio="1/1">
            <img
              src="https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800&auto=format&fit=crop"
              alt="Urban structure"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                border: "2px solid black",
              }}
            />
          </AspectRatio>
        </Box>
      </GridItem>

      {/* Floating Text Box */}
      <GridItem colSpan={4} colStart={8}>
        <Box
          style={{
            marginTop: "-4rem",
            background: "#171717",
            color: "white",
            padding: "2rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          <Box
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              marginBottom: "1rem",
              opacity: 0.7,
            }}
          >
            DETAILS
          </Box>
          <Box style={{ fontSize: "0.875rem", lineHeight: 2 }}>
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
          <AspectRatio ratio="16/9">
            <img
              src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1400&auto=format&fit=crop"
              alt="Wide perspective"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AspectRatio>
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
    columns: "auto",
    gap: 6,
  },
  render: (args) => (
    <Grid {...args} style={{ padding: "2rem" }}>
      {[
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618005198914-c1b89531a13e?w=600&auto=format&fit=crop",
      ].map((src, i) => (
        <Box key={i}>
          <AspectRatio ratio="1/1">
            <img
              src={src}
              alt={`Gallery ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AspectRatio>
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
    columns: 12,
    gap: 6,
  },
  render: (args) => (
    <Grid {...args} style={{ padding: "2rem", background: "white" }}>
      {/* Large Feature Image */}
      <GridItem colSpan={7} colStart={1} rowSpan={2}>
        <AspectRatio ratio={3 / 4}>
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop"
            alt="Feature"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(100%)",
            }}
          />
        </AspectRatio>
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
        <AspectRatio ratio="16/9">
          <img
            src="https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=800&auto=format&fit=crop"
            alt="Detail 1"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AspectRatio>
      </GridItem>

      {/* Wide Image */}
      <GridItem colSpan="full">
        <Box style={{ marginTop: "2rem" }}>
          <AspectRatio ratio="21/9">
            <img
              src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1600&auto=format&fit=crop"
              alt="Wide"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AspectRatio>
        </Box>
      </GridItem>
    </Grid>
  ),
};
