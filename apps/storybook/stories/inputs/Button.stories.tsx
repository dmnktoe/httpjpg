import { Button } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

import { BUTTON_VARIANT_OPTIONS } from "../shared/storybook-helpers";

/**
 * Button component stories
 *
 * The Button component supports multiple variants and sizes with full
 * accessibility support including keyboard navigation and focus states.
 */
const meta = {
  title: "Inputs/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" as const },
      options: BUTTON_VARIANT_OPTIONS,
      description: "Visual style variant of the button",
      table: {
        defaultValue: { summary: "primary" },
      },
    },
    size: {
      control: { type: "select" as const },
      options: ["sm", "md", "lg"] as const,
      description: "Size of the button",
      table: {
        defaultValue: { summary: "md" },
      },
    },
    children: {
      control: "text",
      description: "Button label or content",
      table: {
        type: { summary: "ReactNode" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Disables the button",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    type: {
      control: { type: "select" },
      options: ["button", "submit", "reset"],
      description: "HTML button type attribute",
      table: {
        defaultValue: { summary: "button" },
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Basic button with live controls
 */
export const Basic: Story = {
  args: {
    variant: "primary",
    children: "Click me",
    size: "md",
    disabled: false,
    type: "button",
  },
};

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

export const Accent: Story = {
  args: {
    variant: "accent",
    children: "Accent Button",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Danger Button",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Button",
  },
};

export const Small: Story = {
  args: { size: "sm", children: "Small Button" },
};

export const Medium: Story = {
  args: { size: "md", children: "Medium Button" },
};

export const Large: Story = {
  args: { size: "lg", children: "Large Button" },
};

export const AllSizes: Story = {
  args: {
    children: "Button",
  },
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const AllVariants: Story = {
  args: {
    children: "Button",
  },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Button {...args} variant="primary" size="sm">
          Primary SM
        </Button>
        <Button {...args} variant="primary" size="md">
          Primary MD
        </Button>
        <Button {...args} variant="primary" size="lg">
          Primary LG
        </Button>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Button {...args} variant="secondary" size="sm">
          Secondary SM
        </Button>
        <Button {...args} variant="secondary" size="md">
          Secondary MD
        </Button>
        <Button {...args} variant="secondary" size="lg">
          Secondary LG
        </Button>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Button {...args} variant="accent" size="sm">
          Accent SM
        </Button>
        <Button {...args} variant="accent" size="md">
          Accent MD
        </Button>
        <Button {...args} variant="accent" size="lg">
          Accent LG
        </Button>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Button {...args} variant="danger" size="sm">
          Danger SM
        </Button>
        <Button {...args} variant="danger" size="md">
          Danger MD
        </Button>
        <Button {...args} variant="danger" size="lg">
          Danger LG
        </Button>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Button variant="primary" size="md" disabled>
          Disabled
        </Button>
        <Button variant="secondary" size="md" disabled>
          Disabled
        </Button>
        <Button variant="accent" size="md" disabled>
          Disabled
        </Button>
      </div>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "primary",
    size: "md",
    children: "Edit me in controls!",
    disabled: false,
  },
};
