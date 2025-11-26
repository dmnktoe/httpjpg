import { Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Typography/Paragraph",
  component: Paragraph,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A responsive paragraph component with optimal typography settings for body text. Features adjustable sizing, alignment, and optional max-width constraint for comfortable reading.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    as: {
      control: { type: "select" },
      options: ["p", "span", "div"],
      description: "Render as different HTML element",
      table: {
        defaultValue: { summary: "p" },
      },
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl"],
      description: "Visual size variant",
      table: {
        type: { summary: "sm | md | lg | xl" },
        defaultValue: { summary: "sm" },
      },
    },
    align: {
      control: { type: "select" },
      options: ["left", "center", "right", "justify"],
      description: "Text alignment",
      table: {
        type: { summary: "left | center | right | justify" },
        defaultValue: { summary: "left" },
      },
    },
    color: {
      control: { type: "select" },
      options: ["default", "muted", "dimmed"],
      description: "Text color variant",
      table: {
        defaultValue: { summary: "default" },
      },
    },
    weight: {
      control: { type: "select" },
      options: ["normal", "medium", "semibold"],
      description: "Font weight",
      table: {
        defaultValue: { summary: "normal" },
      },
    },
    maxWidth: {
      control: "text",
      description:
        "Max width constraint (true=65ch, false=none, or custom like '80ch')",
      table: {
        type: { summary: "boolean | string" },
        defaultValue: { summary: "true" },
      },
    },
    spacing: {
      control: "boolean",
      description: "Add bottom spacing for multiple paragraphs",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    children: {
      control: "text",
      description: "Paragraph content",
    },
  },
} satisfies Meta<typeof Paragraph>;

export default meta;
type Story = StoryObj<typeof meta>;

const longText =
  "Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line spacing, letter spacing, and spaces between pairs of letters.";

const mediumText =
  "Good typography enhances readability and creates visual hierarchy. It guides the reader's eye through the content naturally.";

const shortText = "A brief statement about design principles.";

/**
 * Basic paragraph with live controls
 */
export const Basic: Story = {
  args: {
    size: "sm",
    align: "left",
    color: "default",
    weight: "normal",
    maxWidth: true,
    spacing: false,
    children: mediumText,
  },
};

/**
 * Medium size for standard body text.
 */
export const Medium: Story = {
  args: {
    size: "md",
    children: mediumText,
  },
};

/**
 * Large paragraph for emphasis or introductory text.
 */
export const Large: Story = {
  args: {
    size: "lg",
    children: longText,
  },
};

/**
 * Extra large paragraph for hero or prominent text.
 */
export const ExtraLarge: Story = {
  args: {
    size: "xl",
    children: longText,
  },
};

/**
 * Centered paragraph, useful for quotes or callouts.
 */
export const Centered: Story = {
  args: {
    align: "center",
    maxWidth: false,
    children: shortText,
  },
};

/**
 * Right-aligned paragraph.
 */
export const RightAligned: Story = {
  args: {
    align: "right",
    maxWidth: false,
    children: shortText,
  },
};

/**
 * Justified paragraph for formal layouts.
 */
export const Justified: Story = {
  args: {
    align: "justify",
    children: longText,
  },
};

/**
 * Muted color for secondary text.
 */
export const MutedColor: Story = {
  args: {
    color: "muted",
    children: mediumText,
  },
};

/**
 * Dimmed color for tertiary text.
 */
export const DimmedColor: Story = {
  args: {
    color: "dimmed",
    children: mediumText,
  },
};

/**
 * Medium weight for emphasis.
 */
export const MediumWeight: Story = {
  args: {
    weight: "medium",
    children: mediumText,
  },
};

/**
 * Semibold weight for strong emphasis.
 */
export const SemiboldWeight: Story = {
  args: {
    weight: "semibold",
    children: mediumText,
  },
};

/**
 * Paragraph without max-width constraint, spans full container width.
 */
export const FullWidth: Story = {
  args: {
    maxWidth: false,
    children: longText,
  },
};

/**
 * Custom max-width for specific layouts.
 */
export const CustomMaxWidth: Story = {
  args: {
    maxWidth: "80ch",
    children: longText,
  },
};

/**
 * Render as span element.
 */
export const AsSpan: Story = {
  args: {
    as: "span",
    size: "sm",
    children: "This renders as a <span> element.",
  },
};

/**
 * Multiple paragraphs demonstrating typical content flow.
 */
export const MultiParagraph: Story = {
  args: {
    children: null,
  },
  render: () => (
    <>
      <Paragraph size="lg" spacing>
        Typography is fundamental to good design. It creates hierarchy,
        organizes information, and makes content accessible.
      </Paragraph>
      <Paragraph spacing>
        The choice of typeface, size, spacing, and alignment all contribute to
        the overall reading experience. Proper typography enhances comprehension
        and keeps readers engaged.
      </Paragraph>
      <Paragraph size="sm" color="muted">
        Small text is perfect for captions, footnotes, or supplementary
        information that supports the main content without overwhelming it.
      </Paragraph>
    </>
  ),
};

/**
 * Combined features showcase.
 */
export const CombinedFeatures: Story = {
  args: {
    children: null,
  },
  render: () => (
    <>
      <Paragraph size="xl" weight="semibold" spacing>
        Large Bold Heading Paragraph
      </Paragraph>
      <Paragraph size="lg" color="muted" spacing>
        Medium muted introduction text with optimal reading width.
      </Paragraph>
      <Paragraph align="justify" spacing>
        {longText}
      </Paragraph>
      <Paragraph size="sm" color="dimmed" maxWidth="40ch">
        Small dimmed footnote with narrow max-width for captions.
      </Paragraph>
    </>
  ),
};

/**
 * Custom styling with css prop.
 * Note: Use token reference syntax {tokenName} for design tokens in css prop.
 */
export const CustomStyled: Story = {
  args: {
    children:
      "This paragraph uses the css prop for custom styling with token references.",
  },
  render: (args) => (
    <Paragraph
      {...args}
      css={{
        fontSize: "{fontSizes.base}", // Token reference syntax for Panda CSS
        color: "#DC2626",
        fontStyle: "italic",
        borderLeft: "4px solid #F87171",
        pl: "4",
      }}
    />
  ),
};
