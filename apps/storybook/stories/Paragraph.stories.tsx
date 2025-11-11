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
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Visual size variant",
      table: {
        type: { summary: "sm | md | lg" },
        defaultValue: { summary: "md" },
      },
    },
    align: {
      control: "select",
      options: ["left", "center", "right"],
      description: "Text alignment",
      table: {
        type: { summary: "left | center | right" },
        defaultValue: { summary: "left" },
      },
    },
    maxWidth: {
      control: "boolean",
      description:
        "Apply max-width constraint for optimal reading (~60-75 characters per line)",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
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
 * Default paragraph with medium size and left alignment.
 */
export const Default: Story = {
  args: {
    children: mediumText,
  },
};

/**
 * Small paragraph for secondary or supporting content.
 */
export const Small: Story = {
  args: {
    size: "sm",
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
 * Centered paragraph, useful for quotes or callouts.
 */
export const Centered: Story = {
  args: {
    align: "center",
    children: shortText,
  },
};

/**
 * Right-aligned paragraph.
 */
export const RightAligned: Story = {
  args: {
    align: "right",
    children: shortText,
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
  parameters: {
    docs: {
      description: {
        story:
          "Without the max-width constraint, the paragraph will span the full width of its container. This can be useful in narrow containers or specific layout requirements.",
      },
    },
  },
};

/**
 * Multiple paragraphs demonstrating typical content flow.
 */
export const MultiParagraph: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Paragraph size="lg">
        Typography is fundamental to good design. It creates hierarchy,
        organizes information, and makes content accessible.
      </Paragraph>
      <Paragraph>
        The choice of typeface, size, spacing, and alignment all contribute to
        the overall reading experience. Proper typography enhances comprehension
        and keeps readers engaged.
      </Paragraph>
      <Paragraph size="sm">
        Small text is perfect for captions, footnotes, or supplementary
        information that supports the main content without overwhelming it.
      </Paragraph>
    </div>
  ),
};

/**
 * Paragraph with custom styling using className prop.
 */
export const CustomStyled: Story = {
  args: {
    children: "This paragraph has custom styling applied via className.",
    className: "custom-paragraph",
    style: {
      color: "#E11D48",
      fontStyle: "italic",
      borderLeft: "4px solid #F43F5E",
      paddingLeft: "1rem",
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "You can extend the component with custom styles using the className prop or inline styles for one-off cases.",
      },
    },
  },
};
