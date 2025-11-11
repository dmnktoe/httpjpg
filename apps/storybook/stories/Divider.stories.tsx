import { Divider, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Divider component stories
 *
 * Visual separator with support for ASCII art, custom content, and traditional lines.
 * Perfect for brutalist design with decorative separators and overlapping text.
 */
const meta = {
  title: "Layout/Divider",
  component: Divider,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: { type: "select" },
      options: ["horizontal", "vertical"],
      description: "Divider orientation",
      table: {
        defaultValue: { summary: "horizontal" },
      },
    },
    variant: {
      control: { type: "select" },
      options: ["solid", "dashed", "dotted", "ascii", "custom"],
      description: "Divider style variant",
      table: {
        defaultValue: { summary: "solid" },
      },
    },
    pattern: {
      control: "text",
      description: "ASCII pattern for divider",
      table: {
        defaultValue: { summary: "*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚" },
      },
    },
    spacing: {
      control: { type: "select" },
      options: [0, 1, 2, 4, 6, 8, 12, 16],
      description: "Spacing around divider",
      table: {
        defaultValue: { summary: "4" },
      },
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default solid divider
 */
export const Solid: Story = {
  render: () => (
    <div>
      <Paragraph>Content above divider</Paragraph>
      <Divider variant="solid" />
      <Paragraph>Content below divider</Paragraph>
    </div>
  ),
};

/**
 * ASCII art divider (brutalist style)
 */
export const ASCII: Story = {
  render: () => (
    <div>
      <Paragraph>Section One</Paragraph>
      <Divider variant="ascii" pattern="*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚" />
      <Paragraph>Section Two</Paragraph>
      <Divider variant="ascii" pattern="・゜゜・。。・゜゜・。。・゜゜・。" />
      <Paragraph>Section Three</Paragraph>
      <Divider variant="ascii" pattern="━━━━━━━ ∘◦ ❈ ◦∘ ━━━━━━━" />
      <Paragraph>Section Four</Paragraph>
    </div>
  ),
};

/**
 * Custom content divider
 */
export const CustomContent: Story = {
  render: () => (
    <div>
      <Paragraph>Main content section</Paragraph>
      <Divider variant="custom" spacing={8}>
        → SECTION BREAK ←
      </Divider>
      <Paragraph>Next section</Paragraph>
      <Divider variant="custom" spacing={8}>
        ✦ ✦ ✦
      </Divider>
      <Paragraph>Another section</Paragraph>
    </div>
  ),
};

/**
 * Dashed and dotted variants
 */
export const DashedAndDotted: Story = {
  render: () => (
    <div>
      <Paragraph>Dashed divider</Paragraph>
      <Divider variant="dashed" thickness="2px" />
      <Paragraph>Dotted divider</Paragraph>
      <Divider variant="dotted" thickness="3px" />
      <Paragraph>End of content</Paragraph>
    </div>
  ),
};

/**
 * Vertical divider
 */
export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", minHeight: "200px" }}>
      <div style={{ padding: "1rem" }}>
        <Paragraph>Left side</Paragraph>
      </div>
      <Divider orientation="vertical" variant="solid" thickness="2px" />
      <div style={{ padding: "1rem" }}>
        <Paragraph>Middle section</Paragraph>
      </div>
      <Divider orientation="vertical" variant="ascii" pattern="｜｜｜" />
      <div style={{ padding: "1rem" }}>
        <Paragraph>Right side</Paragraph>
      </div>
    </div>
  ),
};

/**
 * Brutalist magazine-style dividers
 */
export const BrutalistStyle: Story = {
  render: () => (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "2rem", fontWeight: 900 }}>ARTICLE TITLE</h2>
      <Divider
        variant="ascii"
        pattern="━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        spacing={6}
      />

      <Paragraph>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Paragraph>

      <Divider variant="ascii" pattern="∴∵∴∵∴∵∴∵∴∵∴∵∴∵∴∵∴∵∴" spacing={8} />

      <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>SECTION BREAK</h3>
      <Divider variant="custom" spacing={6}>
        ❋ ❋ ❋ ❋ ❋
      </Divider>

      <Paragraph>
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliquip ex ea commodo consequat.
      </Paragraph>

      <Divider variant="ascii" pattern="◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆" spacing={6} />

      <Paragraph>End of article</Paragraph>
    </div>
  ),
};

/**
 * Thick dividers
 */
export const Thick: Story = {
  render: () => (
    <div>
      <Paragraph>1px thickness (default)</Paragraph>
      <Divider variant="solid" thickness="1px" />

      <Paragraph>2px thickness</Paragraph>
      <Divider variant="solid" thickness="2px" />

      <Paragraph>3px thickness</Paragraph>
      <Divider variant="solid" thickness="3px" />

      <Paragraph>4px thickness</Paragraph>
      <Divider variant="solid" thickness="4px" />
    </div>
  ),
};
