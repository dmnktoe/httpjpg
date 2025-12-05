import { AnimateInView, Box, Headline, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * AnimateInView component stories
 *
 * Scroll-triggered animations using Framer Motion. Respects user's
 * reduced motion preferences for accessibility.
 */
const meta = {
  title: "Animation & Effects/AnimateInView",
  component: AnimateInView,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    animation: {
      control: "select",
      options: [
        "none",
        "fadeIn",
        "zoomIn",
        "zoomSharpen",
        "sharpen",
        "slideInFromLeft",
        "slideInFromRight",
        "slideUp",
        "slideDown",
      ],
      description: "Animation type",
      table: {
        defaultValue: { summary: "zoomIn" },
      },
    },
    duration: {
      control: { type: "range", min: 0.1, max: 2, step: 0.1 },
      description: "Animation duration in seconds",
      table: {
        defaultValue: { summary: "0.6" },
      },
    },
    delay: {
      control: { type: "range", min: 0, max: 2, step: 0.1 },
      description: "Animation delay in seconds",
    },
    once: {
      control: "boolean",
      description: "Only animate once",
      table: {
        defaultValue: { summary: "true" },
      },
    },
  },
} satisfies Meta<typeof AnimateInView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default fade in animation
 */
export const Default: Story = {
  args: {
    animation: "fadeIn",
    duration: 0.6,
    once: true,
    children: (
      <Box css={{ p: "32px", bg: "neutral.100", textAlign: "center" }}>
        <Headline level={2}>Animated Content</Headline>
        <Paragraph css={{ mt: "8px" }}>
          This content fades in when scrolled into view
        </Paragraph>
      </Box>
    ),
  },
};

/**
 * Zoom in animation
 */
export const ZoomIn: Story = {
  args: {
    animation: "zoomIn",
    duration: 0.8,
    children: (
      <Box
        css={{
          p: "48px",
          bg: "primary.500",
          color: "white",
          textAlign: "center",
        }}
      >
        <Headline level={1} css={{ color: "white" }}>
          Zoom!
        </Headline>
      </Box>
    ),
  },
};

/**
 * Sharpen effect (blur to clear)
 */
export const Sharpen: Story = {
  args: {
    animation: "sharpen",
    duration: 1.2,
    children: (
      <Box
        as="img"
        src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop"
        alt="Sample image"
        css={{ w: "600px", h: "400px", objectFit: "cover" }}
      />
    ),
  },
};

/**
 * Zoom + Sharpen combined
 */
export const ZoomSharpen: Story = {
  args: {
    animation: "zoomSharpen",
    duration: 1,
    children: (
      <Box
        as="img"
        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
        alt="Sample image"
        css={{ w: "600px", h: "400px", objectFit: "cover" }}
      />
    ),
  },
};

/**
 * Slide from left
 */
export const SlideLeft: Story = {
  args: {
    animation: "slideInFromLeft",
    duration: 0.6,
    children: (
      <Box css={{ p: "32px", bg: "accent.500", color: "white" }}>
        <Headline level={3} css={{ color: "white" }}>
          Sliding from the left!
        </Headline>
      </Box>
    ),
  },
};

/**
 * Slide from right
 */
export const SlideRight: Story = {
  args: {
    animation: "slideInFromRight",
    duration: 0.6,
    children: (
      <Box css={{ p: "32px", bg: "accent.600", color: "white" }}>
        <Headline level={3} css={{ color: "white" }}>
          Sliding from the right!
        </Headline>
      </Box>
    ),
  },
};

/**
 * Slide up
 */
export const SlideUp: Story = {
  args: {
    animation: "slideUp",
    duration: 0.8,
    children: (
      <Box
        css={{
          p: "48px",
          bg: "neutral.900",
          color: "white",
          textAlign: "center",
        }}
      >
        <Headline level={2} css={{ color: "white" }}>
          Rising Up ↑
        </Headline>
      </Box>
    ),
  },
};

/**
 * With delay
 */
export const WithDelay: Story = {
  args: {
    animation: "fadeIn",
    duration: 0.6,
    delay: 1,
    children: (
      <Box css={{ p: "32px", bg: "primary.100", textAlign: "center" }}>
        <Paragraph>This appears after 1 second delay</Paragraph>
      </Box>
    ),
  },
};

/**
 * Multiple animated elements (scroll down to see)
 */
export const Multiple: Story = {
  args: { children: null },
  render: () => (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        maxW: "600px",
      }}
    >
      <AnimateInView animation="fadeIn" delay={0}>
        <Box css={{ p: "24px", bg: "neutral.100" }}>
          <Headline level={3}>First Element</Headline>
          <Paragraph css={{ mt: "8px" }}>Fades in immediately</Paragraph>
        </Box>
      </AnimateInView>

      <AnimateInView animation="slideInFromLeft" delay={0.2}>
        <Box css={{ p: "24px", bg: "neutral.200" }}>
          <Headline level={3}>Second Element</Headline>
          <Paragraph css={{ mt: "8px" }}>
            Slides from left with 0.2s delay
          </Paragraph>
        </Box>
      </AnimateInView>

      <AnimateInView animation="slideInFromRight" delay={0.4}>
        <Box css={{ p: "24px", bg: "neutral.300" }}>
          <Headline level={3}>Third Element</Headline>
          <Paragraph css={{ mt: "8px" }}>
            Slides from right with 0.4s delay
          </Paragraph>
        </Box>
      </AnimateInView>

      <AnimateInView animation="zoomIn" delay={0.6}>
        <Box css={{ p: "24px", bg: "primary.500", color: "white" }}>
          <Headline level={3} css={{ color: "white" }}>
            Fourth Element
          </Headline>
          <Paragraph css={{ mt: "8px", color: "white" }}>
            Zooms in with 0.6s delay
          </Paragraph>
        </Box>
      </AnimateInView>
    </Box>
  ),
};

/**
 * No animation (instant)
 */
export const None: Story = {
  args: {
    animation: "none",
    children: (
      <Box css={{ p: "32px", bg: "neutral.100" }}>
        <Paragraph>No animation applied</Paragraph>
      </Box>
    ),
  },
};
