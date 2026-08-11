import { HStack, Tag, TagButton } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "Display/Tag",
  component: Tag,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text", description: "The tag's display label" },
    showMarker: {
      control: "boolean",
      description: "Show the `#` marker",
      table: { defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

const LABELS = ["TypeScript", "Next.js", "iOS", "Art Direction", "GLSL", "Client Work"];

export const Default: Story = {
  args: { children: "TypeScript" },
};

/**
 * Labels render in the body sans at their authored casing, so `Next.js` and
 * `iOS` survive intact. Only the `#` stays monospaced.
 */
export const Row: Story = {
  args: { children: "TypeScript" },
  render: () => (
    <HStack gap="2" css={{ flexWrap: "wrap", maxW: "32rem" }}>
      {LABELS.map((label) => (
        <Tag key={label}>{label}</Tag>
      ))}
    </HStack>
  ),
};

/** Without the marker, for places where the tag reads as a plain label. */
export const WithoutMarker: Story = {
  args: { children: "Client Work", showMarker: false },
};

/** The interactive form. `all` is pressed until a tag is picked. */
export const Interactive: Story = {
  args: { children: "TypeScript" },
  render: () => {
    const Demo = () => {
      const [active, setActive] = useState<string | null>(null);
      return (
        <HStack gap="2" css={{ flexWrap: "wrap", maxW: "32rem" }}>
          <TagButton isActive={!active} showMarker={false} onClick={() => setActive(null)}>
            all
          </TagButton>
          {LABELS.map((label) => (
            <TagButton
              key={label}
              isActive={active === label}
              onClick={() => setActive((current) => (current === label ? null : label))}
            >
              {label}
            </TagButton>
          ))}
        </HStack>
      );
    };
    return <Demo />;
  },
};

/** Both states side by side. */
export const States: Story = {
  args: { children: "TypeScript" },
  render: () => (
    <HStack gap="2">
      <TagButton>Resting</TagButton>
      <TagButton isActive>Active</TagButton>
      <Tag>Static</Tag>
    </HStack>
  ),
};
