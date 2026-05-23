import { Accordion, Box } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const FAQ_ITEMS = [
  {
    id: "what",
    title: "What is this place?",
    content: "A brutalist portfolio site driven by Storyblok CMS and Next.js.",
    defaultOpen: true,
  },
  {
    id: "tech",
    title: "What's the stack?",
    content: "TypeScript, React 19, Next.js 16, Panda CSS, Storyblok, Sentry.",
  },
  {
    id: "hire",
    title: "Available for hire?",
    content: "Sometimes. Send a brief, get a reply.",
  },
  {
    id: "fonts",
    title: "What fonts do you use?",
    content: "Inter for body, JetBrains Mono for code, system serif for accents.",
  },
];

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" as const },
      options: ["default", "bordered", "brutalist"],
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: { type: "select" as const },
      options: ["sm", "md", "lg"],
      table: { defaultValue: { summary: "md" } },
    },
    allowMultiple: {
      control: "boolean",
      description: "Allow multiple panels open simultaneously.",
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    items: FAQ_ITEMS,
    variant: "default",
    size: "md",
    allowMultiple: false,
  },
};

export const Bordered: Story = {
  args: {
    items: FAQ_ITEMS,
    variant: "bordered",
  },
};

export const Brutalist: Story = {
  args: {
    items: FAQ_ITEMS,
    variant: "brutalist",
  },
};

export const AllowMultiple: Story = {
  args: {
    items: FAQ_ITEMS,
    allowMultiple: true,
    variant: "bordered",
  },
};

export const Sizes: Story = {
  args: { items: FAQ_ITEMS.slice(0, 2) },
  render: (args) => (
    <Box css={{ display: "flex", flexDirection: "column", gap: "8" }}>
      <Accordion {...args} items={FAQ_ITEMS.slice(0, 2)} size="sm" variant="bordered" />
      <Accordion {...args} items={FAQ_ITEMS.slice(0, 2)} size="md" variant="bordered" />
      <Accordion {...args} items={FAQ_ITEMS.slice(0, 2)} size="lg" variant="bordered" />
    </Box>
  ),
};
