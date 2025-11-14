import { Box, Divider, Paragraph } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import {
  DIVIDER_ORIENTATION_OPTIONS,
  DIVIDER_VARIANT_OPTIONS,
  spacingArgType,
} from "./storybook-helpers";

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
      control: { type: "select" as const },
      options: DIVIDER_ORIENTATION_OPTIONS,
      description: "Divider orientation",
      table: {
        defaultValue: { summary: "horizontal" },
      },
    },
    variant: {
      control: { type: "select" as const },
      options: DIVIDER_VARIANT_OPTIONS,
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
    spacing: spacingArgType("Spacing around divider", "4"),
    thickness: {
      control: "text",
      description: "Border thickness (CSS value)",
      table: {
        defaultValue: { summary: "1px" },
      },
    },
    color: {
      control: { type: "select" as const },
      options: [
        "black",
        "white",
        "neutral.50",
        "neutral.100",
        "neutral.200",
        "neutral.300",
        "neutral.400",
        "neutral.500",
        "neutral.600",
        "neutral.700",
        "neutral.800",
        "neutral.900",
        "neutral.950",
        "primary.500",
        "primary.600",
        "accent.500",
        "accent.600",
      ],
      description: "Divider color (Panda color token)",
      table: {
        defaultValue: { summary: "neutral.300" },
      },
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic divider with live controls
 */
export const Basic: Story = {
  args: {
    variant: "solid",
    orientation: "horizontal",
    spacing: 4,
    thickness: "1px",
    color: "neutral.300",
    children: null,
  },
  render: (args) => (
    <div>
      <Paragraph>Content above divider</Paragraph>
      <Divider {...args} />
      <Paragraph>Content below divider</Paragraph>
    </div>
  ),
};

/**
 * Default solid divider
 */
export const Solid: Story = {
  args: {
    children: null,
  },
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
  args: {
    children: null,
  },
  render: () => (
    <>
      <Paragraph>Section One</Paragraph>
      <Divider variant="ascii" pattern="*ੈ✩‧₊˚༺☆༻*ੈ✩‧₊˚" />
      <Paragraph>Section Two</Paragraph>
      <Divider variant="ascii" pattern="・゜゜・。。・゜゜・。。・゜゜・。" />
      <Paragraph>Section Three</Paragraph>
      <Divider variant="ascii" pattern="━━━━━━━ ∘◦ ❈ ◦∘ ━━━━━━━" />
      <Paragraph>Section Four</Paragraph>
    </>
  ),
};

/**
 * Custom content divider
 */
export const CustomContent: Story = {
  args: {
    children: null,
  },
  render: () => (
    <>
      <Paragraph>Main content section</Paragraph>
      <Divider variant="custom" spacing={8}>
        → SECTION BREAK ←
      </Divider>
      <Paragraph>Next section</Paragraph>
      <Divider variant="custom" spacing={8}>
        ✦ ✦ ✦
      </Divider>
      <Paragraph>Another section</Paragraph>
    </>
  ),
};

/**
 * Dashed and dotted variants
 */
export const DashedAndDotted: Story = {
  args: {
    children: null,
  },
  render: () => (
    <>
      <Paragraph>Dashed divider</Paragraph>
      <Divider variant="dashed" thickness="2px" />
      <Paragraph>Dotted divider</Paragraph>
      <Divider variant="dotted" thickness="3px" />
      <Paragraph>End of content</Paragraph>
    </>
  ),
};

/**
 * Vertical divider
 */
export const Vertical: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Box css={{ display: "flex", alignItems: "center", minH: "200px" }}>
      <Box css={{ p: "4" }}>
        <Paragraph>Left side</Paragraph>
      </Box>
      <Divider orientation="vertical" variant="solid" thickness="2px" />
      <Box css={{ p: "4" }}>
        <Paragraph>Middle section</Paragraph>
      </Box>
      <Divider orientation="vertical" variant="ascii" pattern="｜｜｜" />
      <Box css={{ p: "4" }}>
        <Paragraph>Right side</Paragraph>
      </Box>
    </Box>
  ),
};

/**
 * Brutalist magazine-style dividers
 */
export const BrutalistStyle: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Box css={{ maxW: "800px", m: "0 auto" }}>
      <Box as="h2" css={{ fontSize: "2rem", fontWeight: 900 }}>
        ARTICLE TITLE
      </Box>
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

      <Box as="h3" css={{ fontSize: "1.5rem", fontWeight: 800 }}>
        SECTION BREAK
      </Box>
      <Divider variant="custom" spacing={6}>
        ❋ ❋ ❋ ❋ ❋
      </Divider>

      <Paragraph>
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliquip ex ea commodo consequat.
      </Paragraph>

      <Divider variant="ascii" pattern="◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆" spacing={6} />

      <Paragraph>End of article</Paragraph>
    </Box>
  ),
};

/**
 * Thick dividers
 */
export const Thick: Story = {
  args: {
    children: null,
  },
  render: () => (
    <>
      <Paragraph>1px thickness (default)</Paragraph>
      <Divider variant="solid" thickness="1px" />

      <Paragraph>2px thickness</Paragraph>
      <Divider variant="solid" thickness="2px" />

      <Paragraph>3px thickness</Paragraph>
      <Divider variant="solid" thickness="3px" />

      <Paragraph>4px thickness</Paragraph>
      <Divider variant="solid" thickness="4px" />
    </>
  ),
};
