import { Button } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { BUTTON_VARIANT_OPTIONS } from "./storybook-helpers";

/**
 * Button component stories
 *
 * The Button component supports multiple variants and sizes with full
 * accessibility support including keyboard navigation and focus states.
 */
const meta = {
  title: "Components/Button",
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

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline Button",
  },
};

export const Disabled: Story = {
  args: {
    variant: "disabled",
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
        <Button {...args} variant="outline" size="sm">
          Outline SM
        </Button>
        <Button {...args} variant="outline" size="md">
          Outline MD
        </Button>
        <Button {...args} variant="outline" size="lg">
          Outline LG
        </Button>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Button {...args} variant="disabled" size="sm">
          Disabled SM
        </Button>
        <Button {...args} variant="disabled" size="md">
          Disabled MD
        </Button>
        <Button {...args} variant="disabled" size="lg">
          Disabled LG
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
