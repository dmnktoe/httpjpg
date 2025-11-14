import { Box, Center, Headline, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Center component stories
 *
 * A utility component for centering content horizontally and/or vertically.
 * Perfect for hero sections, modal content, and centered layouts.
 */
const meta = {
  title: "Layout/Center",
  component: Center,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    horizontal: {
      control: "boolean",
      description: "Center horizontally",
      table: {
        defaultValue: { summary: "true" },
      },
    },
    vertical: {
      control: "boolean",
      description: "Center vertically",
      table: {
        defaultValue: { summary: "true" },
      },
    },
    useFlex: {
      control: "boolean",
      description: "Use flexbox instead of grid",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    minHeight: {
      control: "text",
      description: "Minimum height (for vertical centering)",
      table: {
        defaultValue: { summary: "auto" },
      },
    },
  },
} satisfies Meta<typeof Center>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic center - Both horizontal and vertical
 */
export const Basic: Story = {
  args: {
    horizontal: true,
    vertical: true,
    minHeight: "400px",
    children: (
      <Box
        style={{
          background: "#171717",
          color: "white",
          padding: "2rem",
          border: "4px solid black",
        }}
      >
        <Headline level={2} style={{ color: "white", margin: 0 }}>
          CENTERED
        </Headline>
      </Box>
    ),
  },
};

/**
 * Horizontal only
 */
export const HorizontalOnly: Story = {
  args: {
    horizontal: true,
    vertical: false,
    children: (
      <Box
        style={{
          background: "white",
          border: "2px solid black",
          padding: "1.5rem",
        }}
      >
        <Paragraph style={{ margin: 0 }}>
          Horizontally centered content
        </Paragraph>
      </Box>
    ),
  },
};

/**
 * Vertical only
 */
export const VerticalOnly: Story = {
  args: {
    horizontal: false,
    vertical: true,
    minHeight: "400px",
    children: (
      <Box
        style={{
          background: "#f5f5f5",
          padding: "1.5rem",
          border: "2px solid black",
        }}
      >
        <Paragraph style={{ margin: 0 }}>Vertically centered content</Paragraph>
      </Box>
    ),
  },
};

/**
 * Using flexbox instead of grid
 */
export const WithFlex: Story = {
  args: {
    horizontal: true,
    vertical: true,
    useFlex: true,
    minHeight: "400px",
    children: (
      <Box
        style={{
          background: "white",
          border: "4px solid black",
          padding: "2rem",
          boxShadow: "8px 8px 0 black",
        }}
      >
        <Headline level={3} style={{ margin: 0 }}>
          Flexbox Center
        </Headline>
      </Box>
    ),
  },
};

/**
 * Hero section example
 */
export const HeroSection: Story = {
  render: () => (
    <Center
      horizontal
      vertical
      minHeight="500px"
      style={{
        background: "#171717",
        width: "100%",
      }}
    >
      <Box style={{ textAlign: "center", maxWidth: "600px", padding: "2rem" }}>
        <Box
          style={{
            fontFamily: "monospace",
            fontSize: "0.75rem",
            color: "white",
            marginBottom: "1rem",
            opacity: 0.7,
          }}
        >
          PORTFOLIO / 2025
        </Box>
        <Headline
          level={1}
          style={{
            color: "white",
            fontSize: "3rem",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          CREATIVE DIRECTION
        </Headline>
        <Paragraph
          style={{
            color: "white",
            marginTop: "1.5rem",
            fontSize: "1.125rem",
            opacity: 0.9,
          }}
        >
          Bold typography meets minimalist brutalism in modern portfolio design.
        </Paragraph>
      </Box>
    </Center>
  ),
};

/**
 * Modal content example
 */
export const ModalContent: Story = {
  render: () => (
    <Box
      style={{
        position: "relative",
        width: "100%",
        height: "500px",
        background: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <Center horizontal vertical style={{ height: "100%" }}>
        <Box
          style={{
            background: "white",
            border: "4px solid black",
            padding: "3rem",
            maxWidth: "400px",
            boxShadow: "12px 12px 0 rgba(0, 0, 0, 0.8)",
          }}
        >
          <Headline level={2} style={{ margin: 0, marginBottom: "1rem" }}>
            Modal Title
          </Headline>
          <Paragraph style={{ margin: 0, marginBottom: "1.5rem" }}>
            Centered modal content with brutalist styling.
          </Paragraph>
          <Box
            style={{
              background: "#171717",
              color: "white",
              padding: "0.75rem 1.5rem",
              textAlign: "center",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            CLOSE
          </Box>
        </Box>
      </Center>
    </Box>
  ),
};

/**
 * Loading state example
 */
export const LoadingState: Story = {
  render: () => (
    <Center horizontal vertical minHeight="400px">
      <Box style={{ textAlign: "center" }}>
        <Box
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid black",
            borderTop: "4px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 1rem",
          }}
        />
        <Paragraph
          style={{ margin: 0, fontFamily: "monospace", fontSize: "0.875rem" }}
        >
          LOADING...
        </Paragraph>
      </Box>
    </Center>
  ),
};

/**
 * Brutalist card centered
 */
export const BrutalistCard: Story = {
  render: () => (
    <Center
      horizontal
      vertical
      minHeight="500px"
      style={{ background: "transparent" }}
    >
      <Box
        style={{
          background: "transparent",
          maxWidth: "500px",
          position: "relative",
        }}
      >
        <Box
          style={{
            padding: "2rem",
            fontFamily: "sans-serif",
          }}
        >
          <Box
            style={{
              fontSize: "0.65rem",
              marginBottom: "0.75rem",
              letterSpacing: "0.1em",
              opacity: 0.6,
            }}
          >
            ⇝ᵣₑcꫀₙₜ 𝒞𝓁LI€NT / 001
          </Box>
          <Headline
            level={2}
            style={{ margin: 0, fontSize: "2rem", fontWeight: 600 }}
          >
            ⋆.˚ ᡣ𐭩 .𖥔˚ CENTERED DESIGN ⋆.˚✮
          </Headline>
          <Paragraph
            style={{
              marginTop: "1rem",
              lineHeight: 1.8,
              fontSize: "0.95rem",
              opacity: 0.8,
            }}
          >
            🎀 ୧ꔛꗃ˖ Center component makes it easy to create perfectly centered
            layouts with modern aesthetics. Combine with other components for
            maximum impact ･ﾟ⋆
          </Paragraph>
        </Box>
      </Box>
    </Center>
  ),
};
