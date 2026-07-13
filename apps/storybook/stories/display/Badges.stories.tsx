import { Badge, BadgeGroup, Badges } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const BLT_BADGES = [
  {
    src: "https://img.shields.io/github/v/release/dmnktoe/blt?label=Version&color=D20515&labelColor=1D1D1B",
    alt: "Version",
    href: "https://github.com/dmnktoe/blt/releases/latest",
  },
  {
    src: "https://img.shields.io/github/downloads/dmnktoe/blt/total?label=Downloads&color=D20515&labelColor=1D1D1B",
    alt: "Downloads",
    href: "https://github.com/dmnktoe/blt/releases",
  },
  {
    src: "https://img.shields.io/badge/macOS-13%2B-D20515?logo=apple&labelColor=1D1D1B",
    alt: "macOS 13+",
    href: "https://dmnktoe.github.io/blt/",
  },
];

const meta = {
  title: "Display/Badges",
  component: Badges,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    items: { control: { type: "object" as const } },
    gap: { control: { type: "text" as const }, table: { defaultValue: { summary: "2" } } },
    align: {
      control: { type: "select" as const },
      options: ["start", "center", "end"],
      table: { defaultValue: { summary: "center" } },
    },
    justify: {
      control: { type: "select" as const },
      options: ["start", "center", "end"],
      table: { defaultValue: { summary: "start" } },
    },
    wrap: { control: { type: "boolean" as const }, table: { defaultValue: { summary: "true" } } },
    inline: {
      control: { type: "boolean" as const },
      table: { defaultValue: { summary: "false" } },
    },
    height: {
      control: { type: "text" as const },
      table: { defaultValue: { summary: "1.5em" } },
    },
  },
} satisfies Meta<typeof Badges>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    items: BLT_BADGES,
  },
};

export const Taller: Story = {
  args: {
    items: BLT_BADGES,
    height: "28px",
    gap: "3",
  },
};

export const Wrapping: Story = {
  args: {
    items: [...BLT_BADGES, ...BLT_BADGES, ...BLT_BADGES],
  },
  parameters: {
    docs: { description: { story: "Badges wrap onto new lines when the row runs out of space." } },
  },
};

export const Inline: Story = {
  args: { items: BLT_BADGES, inline: true },
  render: (args) => (
    <p style={{ maxWidth: "60ch", lineHeight: 1.7 }}>
      A project shipped with pride <Badges {...args} /> and it keeps flowing with the sentence.
    </p>
  ),
  parameters: {
    docs: {
      description: {
        story: "With `inline`, the row renders as a `<span>` and flows next to surrounding text.",
      },
    },
  },
};

export const SingleBadge: StoryObj<typeof Badge> = {
  render: () => <Badge src={BLT_BADGES[0].src} alt="Version" href={BLT_BADGES[0].href} />,
  parameters: {
    docs: {
      description: { story: "The `Badge` primitive renders a single external badge image." },
    },
  },
};

export const ComposedGroup: StoryObj<typeof BadgeGroup> = {
  render: () => (
    <BadgeGroup gap="4" justify="center">
      {BLT_BADGES.map((badge) => (
        <Badge key={badge.alt} src={badge.src} alt={badge.alt} href={badge.href} />
      ))}
    </BadgeGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Compose `Badge` children inside a `BadgeGroup` when you need full control.",
      },
    },
  },
};
