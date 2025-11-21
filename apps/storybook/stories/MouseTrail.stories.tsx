import { Box, Headline, MouseTrail, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * MouseTrail component stories
 *
 * ASCII trails that follow the cursor for interactive brutalist backgrounds.
 * Creates fading particle effects with customizable characters.
 */
const meta = {
  title: "Animation & Effects/MouseTrail",
  component: MouseTrail,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    character: {
      control: "text",
      description: "ASCII character for trail particles",
    },
    count: {
      control: { type: "range", min: 5, max: 50, step: 1 },
      description: "Number of trail particles",
    },
    lifetime: {
      control: { type: "range", min: 200, max: 3000, step: 100 },
      description: "Particle lifetime in milliseconds",
    },
    size: {
      control: "text",
      description: "Font size for particles",
    },
    color: {
      control: "color",
      description: "Particle color",
    },
  },
} satisfies Meta<typeof MouseTrail>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default mouse trail with sparkle effect
 */
export const Default: Story = {
  args: {
    character: "✦",
    count: 20,
    lifetime: 1000,
    size: "24px",
    color: "black",
  },
  render: (args) => (
    <Box>
      <MouseTrail {...args} />
      <Box
        css={{
          minH: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4",
          p: "8",
          bg: "white",
        }}
      >
        <Headline level={1}>MOVE YOUR MOUSE</Headline>
        <Paragraph size="lg">
          Watch the ASCII trail follow your cursor around the screen.
        </Paragraph>
      </Box>
    </Box>
  ),
};

/**
 * Diamond trail variant
 */
export const Diamond: Story = {
  args: {
    character: "◆",
    count: 25,
    lifetime: 1200,
    size: "20px",
    color: "black",
  },
  render: (args) => (
    <Box>
      <MouseTrail {...args} />
      <Box
        css={{
          minH: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: "8",
          bg: "neutral.50",
        }}
      >
        <Headline level={2}>◆ DIAMOND TRAIL ◆</Headline>
      </Box>
    </Box>
  ),
};

/**
 * Star trail variant
 */
export const Star: Story = {
  args: {
    character: "✧",
    count: 30,
    lifetime: 800,
    size: "28px",
    color: "black",
  },
  render: (args) => (
    <Box>
      <MouseTrail {...args} />
      <Box
        css={{
          minH: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: "8",
          bg: "white",
        }}
      >
        <Headline level={2}>✧ STAR TRAIL ✧</Headline>
      </Box>
    </Box>
  ),
};

/**
 * Long lasting trail
 */
export const LongTrail: Story = {
  args: {
    character: "⬥",
    count: 40,
    lifetime: 2000,
    size: "22px",
    color: "black",
  },
  render: (args) => (
    <Box>
      <MouseTrail {...args} />
      <Box
        css={{
          minH: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: "8",
          bg: "neutral.100",
        }}
      >
        <Headline level={2}>LONG LASTING TRAIL</Headline>
      </Box>
    </Box>
  ),
};

/**
 * Short quick trail
 */
export const QuickTrail: Story = {
  args: {
    character: "•",
    count: 15,
    lifetime: 400,
    size: "16px",
    color: "black",
  },
  render: (args) => (
    <Box>
      <MouseTrail {...args} />
      <Box
        css={{
          minH: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: "8",
          bg: "white",
        }}
      >
        <Headline level={2}>QUICK FADE TRAIL</Headline>
      </Box>
    </Box>
  ),
};

/**
 * Large particles
 */
export const LargeParticles: Story = {
  args: {
    character: "✦",
    count: 15,
    lifetime: 1500,
    size: "48px",
    color: "black",
  },
  render: (args) => (
    <Box>
      <MouseTrail {...args} />
      <Box
        css={{
          minH: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: "8",
          bg: "neutral.50",
        }}
      >
        <Headline level={2}>LARGE PARTICLES</Headline>
      </Box>
    </Box>
  ),
};

/**
 * Dense trail with many particles
 */
export const Dense: Story = {
  args: {
    character: "✧",
    count: 50,
    lifetime: 1000,
    size: "18px",
    color: "black",
  },
  render: (args) => (
    <Box>
      <MouseTrail {...args} />
      <Box
        css={{
          minH: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: "8",
          bg: "white",
        }}
      >
        <Headline level={2}>DENSE TRAIL</Headline>
      </Box>
    </Box>
  ),
};

/**
 * Portfolio example with content
 */
export const PortfolioExample: Story = {
  args: {
    character: "✦",
    count: 25,
    lifetime: 1200,
    size: "24px",
    color: "black",
  },
  render: (args) => (
    <Box>
      <MouseTrail {...args} />
      <Box
        css={{
          minH: "100vh",
          p: "8",
          bg: "white",
        }}
      >
        <Box css={{ maxW: "4xl", mx: "auto" }}>
          <Headline level={1} css={{ mb: "8" }}>
            INTERACTIVE PORTFOLIO
          </Headline>

          <Box css={{ display: "grid", gap: "12" }}>
            <Box>
              <Headline level={2} css={{ mb: "4" }}>
                About
              </Headline>
              <Paragraph size="lg">
                Move your mouse around to see the interactive ASCII trail
                effect. This creates a brutalist, playful interaction layer that
                doesn't interfere with content readability.
              </Paragraph>
            </Box>

            <Box>
              <Headline level={2} css={{ mb: "4" }}>
                Projects
              </Headline>
              <Box css={{ display: "grid", gap: "4" }}>
                <Box
                  css={{
                    p: "6",
                    border: "2px solid black",
                    _hover: { bg: "neutral.50" },
                  }}
                >
                  <Headline level={3}>Project Alpha</Headline>
                  <Paragraph>
                    Photography series exploring urban spaces
                  </Paragraph>
                </Box>
                <Box
                  css={{
                    p: "6",
                    border: "2px solid black",
                    _hover: { bg: "neutral.50" },
                  }}
                >
                  <Headline level={3}>Project Beta</Headline>
                  <Paragraph>Experimental digital art collection</Paragraph>
                </Box>
                <Box
                  css={{
                    p: "6",
                    border: "2px solid black",
                    _hover: { bg: "neutral.50" },
                  }}
                >
                  <Headline level={3}>Project Gamma</Headline>
                  <Paragraph>Interactive web experiences</Paragraph>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  ),
};

/**
 * Dark background variant
 */
export const DarkBackground: Story = {
  args: {
    character: "✦",
    count: 30,
    lifetime: 1500,
    size: "28px",
    color: "white",
  },
  render: (args) => (
    <Box>
      <MouseTrail {...args} />
      <Box
        css={{
          minH: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: "8",
          bg: "black",
          color: "white",
        }}
      >
        <Headline level={1}>DARK MODE TRAIL</Headline>
      </Box>
    </Box>
  ),
};

/**
 * Playground with all controls
 */
export const Playground: Story = {
  args: {
    character: "✦",
    count: 20,
    lifetime: 1000,
    size: "24px",
    color: "black",
  },
  render: (args) => (
    <Box>
      <MouseTrail {...args} />
      <Box
        css={{
          minH: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4",
          p: "8",
          bg: "white",
        }}
      >
        <Headline level={1}>MOUSE TRAIL PLAYGROUND</Headline>
        <Paragraph size="lg" css={{ textAlign: "center", maxW: "2xl" }}>
          Experiment with the controls to customize your trail effect. Try
          different characters, counts, lifetimes, and colors.
        </Paragraph>
        <Box
          css={{
            mt: "8",
            p: "8",
            border: "4px solid black",
            bg: "neutral.50",
          }}
        >
          <Paragraph css={{ fontFamily: "monospace", fontWeight: "bold" }}>
            Move your mouse in this area to see the trail effect clearly
          </Paragraph>
        </Box>
      </Box>
    </Box>
  ),
};
