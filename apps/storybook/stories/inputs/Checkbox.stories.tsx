import { Checkbox } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

/**
 * Checkbox component stories
 *
 * A brutalist, mono-styled checkbox. The box paints a tribal ASCII wave
 * (≋) in the accent color when checked, keeps a native input for
 * accessibility and keyboard support, and exposes a peer focus ring.
 * It is controlled — drive `checked` and listen to `onCheckedChange`.
 */
const meta = {
  title: "Inputs/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
      description: "Whether the checkbox is checked (controlled)",
    },
    size: {
      control: { type: "select" as const },
      options: ["sm", "md"] as const,
      description: "Size of the checkbox",
      table: {
        defaultValue: { summary: "md" },
      },
    },
    label: {
      control: "text",
      description: "Inline label rendered to the right of the box",
      table: {
        type: { summary: "ReactNode" },
      },
    },
    marker: {
      control: "text",
      description: "Glyph painted inside the box when checked",
      table: {
        defaultValue: { summary: "≋" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Disables the checkbox",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    required: {
      control: "boolean",
      description: "Marks the underlying input as required",
      table: {
        defaultValue: { summary: "false" },
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Interactive checkbox wired to local state so the controls toggle it live.
 */
export const Basic: Story = {
  args: {
    checked: false,
    label: "Subscribe to the wave",
    size: "md",
    disabled: false,
    required: false,
  },
  render: function BasicCheckbox(args) {
    const [checked, setChecked] = useState(args.checked);
    return <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />;
  },
};

export const Checked: Story = {
  args: { checked: true, label: "Checked" },
};

export const Unchecked: Story = {
  args: { checked: false, label: "Unchecked" },
};

export const WithoutLabel: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  args: { checked: true, disabled: true, label: "Disabled (required)" },
};

export const CustomMarker: Story = {
  args: { checked: true, label: "Custom marker", marker: "✦" },
};

export const AllSizes: Story = {
  args: { checked: true },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <Checkbox checked size="sm" label="Small ≋" />
      <Checkbox checked size="md" label="Medium ≋" />
    </div>
  ),
};

export const AllStates: Story = {
  args: { checked: false },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <Checkbox checked={false} label="Unchecked" />
      <Checkbox checked label="Checked" />
      <Checkbox checked={false} disabled label="Disabled, unchecked" />
      <Checkbox checked disabled label="Disabled, checked" />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    checked: true,
    label: "Edit me in controls!",
    marker: "≋",
    size: "md",
    disabled: false,
    required: false,
  },
  render: function PlaygroundCheckbox(args) {
    const [checked, setChecked] = useState(args.checked);
    return <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />;
  },
};
