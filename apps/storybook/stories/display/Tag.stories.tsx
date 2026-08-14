import { Tag, TagButton } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

/**
 * Tag stories
 *
 * The one chip on the site. `Tag` is the static span a work card renders;
 * `TagButton` is the same shape as a button, intended for the work-list filter,
 * which adopts it when that filter is rebuilt.
 * Both share a single `cva` so their padding and radius cannot drift apart.
 */
const meta = {
  title: "Display/Tag",
  component: Tag,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text", description: "Tag label, in its authored casing" },
    showMarker: {
      control: "boolean",
      description: "Renders the dimmed `#` marker",
      table: { defaultValue: { summary: "true" } },
    },
  },
  args: { children: "TypeScript", showMarker: true },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutMarker: Story = {
  args: { children: "Case Study", showMarker: false },
};

export const Row: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxWidth: 480 }}>
      {["TypeScript", "React", "Next.js", "Panda CSS", "Storyblok", "Vercel"].map((tag) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  render: function InteractiveStory() {
    const tags = ["Frontend", "TypeScript", "React", "iOS"];
    const [active, setActive] = useState<string | null>("TypeScript");

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxWidth: 480 }}>
        {tags.map((tag) => (
          <TagButton
            key={tag}
            isActive={active === tag}
            onClick={() => setActive(active === tag ? null : tag)}
          >
            {tag}
          </TagButton>
        ))}
      </div>
    );
  },
};

/** Counts render in digit lookalikes; the plain number stays in the accessible name. */
export const WithCounts: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxWidth: 480 }}>
      <TagButton showMarker={false} isActive count={1024}>
        all
      </TagButton>
      {[
        ["Installation", 6],
        ["Student Work", 5],
        ["Collaboration", 4],
        ["Motion", 3],
        ["Personal", 2],
        ["Sound Design", 1],
      ].map(([tag, count]) => (
        <TagButton key={tag} count={count as number}>
          {tag as string}
        </TagButton>
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      <Tag>static</Tag>
      <TagButton>idle</TagButton>
      <TagButton isActive>active</TagButton>
      <TagButton showMarker={false}>all</TagButton>
    </div>
  ),
};
