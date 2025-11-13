import { Headline } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { HEADLINE_LEVEL_OPTIONS } from "./storybook-helpers";

/**
 * Headline component stories
 *
 * The Headline component provides semantic heading elements with
 * responsive, fluid typography using CSS clamp(). Features include
 * balanced text wrapping and polymorphic rendering.
 */
const meta = {
  title: "Typography/Headline",
  component: Headline,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    level: {
      control: { type: "inline-radio" as const },
      options: HEADLINE_LEVEL_OPTIONS,
      description: "Visual hierarchy level (affects font size)",
      table: {
        defaultValue: { summary: "1" },
        type: { summary: "1 | 2 | 3" },
      },
    },
    as: {
      control: { type: "select" as const },
      options: ["h1", "h2", "h3", "h4", "h5", "h6"] as const,
      description:
        "Semantic HTML element to render (overrides default element based on level)",
      table: {
        defaultValue: { summary: "matches level (h1, h2, or h3)" },
        type: { summary: "h1 | h2 | h3 | h4 | h5 | h6" },
      },
    },
    children: {
      control: "text",
      description: "Headline text content",
      table: {
        type: { summary: "ReactNode" },
      },
    },
  },
} satisfies Meta<typeof Headline>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Basic headline with live controls
 */
export const Basic: Story = {
  args: {
    level: 1,
    children: "This is a Headline",
  },
};

export const H1: Story = {
  args: {
    level: 1,
    children: "This is a Headline Level 1",
  },
};

export const H2: Story = {
  args: {
    level: 2,
    children: "This is a Headline Level 2",
  },
};

export const H3: Story = {
  args: {
    level: 3,
    children: "This is a Headline Level 3",
  },
};

export const AllLevels: Story = {
  args: {
    children: "Responsive Typography",
  },
  render: (args) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 32,
        maxWidth: 800,
      }}
    >
      <Headline {...args} level={1}>
        Level 1: Hero Page Title
      </Headline>
      <Headline {...args} level={2}>
        Level 2: Section Title
      </Headline>
      <Headline {...args} level={3}>
        Level 3: Subsection Title
      </Headline>
    </div>
  ),
};

export const SemanticFlexibility: Story = {
  args: {
    children: "SEO-Friendly Heading",
  },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: "0.875rem", marginBottom: "8px", color: "#666" }}>
          Visual Level 1, Semantic h2 (for SEO)
        </p>
        <Headline {...args} level={1} as="h2">
          Looks like H1, but is H2
        </Headline>
      </div>
      <div>
        <p style={{ fontSize: "0.875rem", marginBottom: "8px", color: "#666" }}>
          Visual Level 2, Semantic h3
        </p>
        <Headline {...args} level={2} as="h3">
          Looks like H2, but is H3
        </Headline>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    level: 1,
    children: "Edit me in controls!",
  },
};
