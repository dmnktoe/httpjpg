import { Box, Headline, Paragraph, ScrollProgress } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * ScrollProgress component stories
 *
 * Reading progress indicator with ASCII-style bars or chunky progress bars.
 * Shows scroll position for long-form content.
 */
const meta = {
  title: "Animation & Effects/ScrollProgress",
  component: ScrollProgress,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    showPercentage: {
      control: "boolean",
      description: "Show percentage indicator",
    },
    height: {
      control: { type: "range", min: 4, max: 20, step: 2 },
      description: "Progress bar height in pixels",
    },
    color: {
      control: "color",
      description: "Progress bar color",
    },
    backgroundColor: {
      control: "color",
      description: "Background color",
    },
    position: {
      control: "select",
      options: ["top", "bottom"],
      description: "Progress bar position",
    },
    asciiStyle: {
      control: "boolean",
      description: "Use ASCII-style progress bar",
    },
  },
} satisfies Meta<typeof ScrollProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

const LongContent = () => (
  <Box css={{ maxW: "4xl", mx: "auto", p: "8" }}>
    <Headline level={1} css={{ mb: "8" }}>
      SCROLL DOWN TO SEE PROGRESS
    </Headline>

    {[...Array(15)].map((_, i) => (
      <Box key={i} css={{ mb: "8" }}>
        <Headline level={2} css={{ mb: "4" }}>
          Section {i + 1}
        </Headline>
        <Paragraph size="lg" css={{ mb: "4" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </Paragraph>
        <Paragraph>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </Paragraph>
      </Box>
    ))}
  </Box>
);

/**
 * Default ASCII-style progress bar
 */
export const Default: Story = {
  args: {
    showPercentage: true,
    asciiStyle: true,
    position: "top",
  },
  render: (args) => (
    <Box css={{ minH: "200vh", bg: "white" }}>
      <ScrollProgress {...args} />
      <LongContent />
    </Box>
  ),
};

/**
 * ASCII style at bottom
 */
export const ASCIIBottom: Story = {
  args: {
    showPercentage: true,
    asciiStyle: true,
    position: "bottom",
  },
  render: (args) => (
    <Box css={{ minH: "200vh", bg: "white" }}>
      <ScrollProgress {...args} />
      <LongContent />
    </Box>
  ),
};

/**
 * ASCII without percentage
 */
export const ASCIINoPercentage: Story = {
  args: {
    showPercentage: false,
    asciiStyle: true,
    position: "top",
  },
  render: (args) => (
    <Box css={{ minH: "200vh", bg: "white" }}>
      <ScrollProgress {...args} />
      <LongContent />
    </Box>
  ),
};

/**
 * Chunky bar style
 */
export const ChunkyBar: Story = {
  args: {
    showPercentage: true,
    asciiStyle: false,
    height: 8,
    color: "black",
    backgroundColor: "white",
    position: "top",
  },
  render: (args) => (
    <Box css={{ minH: "200vh", bg: "white" }}>
      <ScrollProgress {...args} />
      <LongContent />
    </Box>
  ),
};

/**
 * Thick bar
 */
export const ThickBar: Story = {
  args: {
    showPercentage: true,
    asciiStyle: false,
    height: 16,
    color: "black",
    backgroundColor: "neutral.100",
    position: "top",
  },
  render: (args) => (
    <Box css={{ minH: "200vh", bg: "white" }}>
      <ScrollProgress {...args} />
      <LongContent />
    </Box>
  ),
};

/**
 * Bottom position bar
 */
export const BottomBar: Story = {
  args: {
    showPercentage: true,
    asciiStyle: false,
    height: 8,
    color: "black",
    backgroundColor: "white",
    position: "bottom",
  },
  render: (args) => (
    <Box css={{ minH: "200vh", bg: "white" }}>
      <ScrollProgress {...args} />
      <LongContent />
    </Box>
  ),
};

/**
 * Bar without percentage
 */
export const BarNoPercentage: Story = {
  args: {
    showPercentage: false,
    asciiStyle: false,
    height: 8,
    color: "black",
    backgroundColor: "white",
    position: "top",
  },
  render: (args) => (
    <Box css={{ minH: "200vh", bg: "white" }}>
      <ScrollProgress {...args} />
      <LongContent />
    </Box>
  ),
};

/**
 * Blog post example
 */
export const BlogPost: Story = {
  args: {
    showPercentage: true,
    asciiStyle: true,
    position: "top",
  },
  render: (args) => (
    <Box css={{ minH: "200vh", bg: "white" }}>
      <ScrollProgress {...args} />
      <Box css={{ maxW: "3xl", mx: "auto", p: "8" }}>
        <Box css={{ mb: "12", textAlign: "center" }}>
          <Headline level={1} css={{ mb: "4" }}>
            THE FUTURE OF BRUTALIST WEB DESIGN
          </Headline>
          <Paragraph size="lg" css={{ opacity: 0.7 }}>
            Published on November 20, 2025
          </Paragraph>
        </Box>

        <Box css={{ fontSize: "lg", lineHeight: "relaxed" }}>
          {[...Array(12)].map((_, i) => (
            <Box key={i} css={{ mb: "8" }}>
              <Headline level={2} css={{ mb: "4" }}>
                Chapter {i + 1}
              </Headline>
              <Paragraph css={{ mb: "4" }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </Paragraph>
              <Paragraph css={{ mb: "4" }}>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </Paragraph>
              <Paragraph>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo.
              </Paragraph>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  ),
};

/**
 * Portfolio case study
 */
export const CaseStudy: Story = {
  args: {
    showPercentage: true,
    asciiStyle: false,
    height: 12,
    color: "black",
    backgroundColor: "neutral.50",
    position: "top",
  },
  render: (args) => (
    <Box css={{ minH: "300vh", bg: "white" }}>
      <ScrollProgress {...args} />
      <Box css={{ maxW: "6xl", mx: "auto", p: "8" }}>
        <Box css={{ mb: "16" }}>
          <Headline level={1} css={{ mb: "4", fontSize: "6xl" }}>
            PROJECT ALPHA
          </Headline>
          <Paragraph size="lg">
            A comprehensive case study of our latest brutalist design system
          </Paragraph>
        </Box>

        {["Overview", "Research", "Design", "Development", "Results"].map(
          (section, i) => (
            <Box key={i} css={{ mb: "16" }}>
              <Headline level={2} css={{ mb: "6", fontSize: "4xl" }}>
                {i + 1}. {section}
              </Headline>
              <Box css={{ display: "grid", gap: "6" }}>
                {[...Array(3)].map((_, j) => (
                  <Box key={j}>
                    <Headline level={3} css={{ mb: "3" }}>
                      {section} Detail {j + 1}
                    </Headline>
                    <Paragraph size="lg" css={{ mb: "3" }}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris.
                    </Paragraph>
                    <Paragraph>
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      esse cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint occaecat cupidatat non proident.
                    </Paragraph>
                  </Box>
                ))}
              </Box>
            </Box>
          ),
        )}
      </Box>
    </Box>
  ),
};

/**
 * Minimal progress
 */
export const Minimal: Story = {
  args: {
    showPercentage: false,
    asciiStyle: false,
    height: 4,
    color: "black",
    backgroundColor: "transparent",
    position: "top",
  },
  render: (args) => (
    <Box css={{ minH: "200vh", bg: "white" }}>
      <ScrollProgress {...args} />
      <LongContent />
    </Box>
  ),
};

/**
 * Playground with all controls
 */
export const Playground: Story = {
  args: {
    showPercentage: true,
    height: 8,
    color: "black",
    backgroundColor: "white",
    position: "top",
    asciiStyle: true,
  },
  render: (args) => (
    <Box css={{ minH: "200vh", bg: "white" }}>
      <ScrollProgress {...args} />
      <Box css={{ maxW: "4xl", mx: "auto", p: "8" }}>
        <Headline level={1} css={{ mb: "4" }}>
          SCROLL PROGRESS PLAYGROUND
        </Headline>
        <Paragraph size="lg" css={{ mb: "8" }}>
          Experiment with the controls to customize the progress indicator.
          Scroll down to see it in action.
        </Paragraph>
        <LongContent />
      </Box>
    </Box>
  ),
};
