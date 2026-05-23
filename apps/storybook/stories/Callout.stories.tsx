import { Box, Button, Callout } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const TONES = ["neutral", "info", "success", "warning", "danger", "brutalist"] as const;

const meta = {
  title: "UI/Callout",
  component: Callout,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: { type: "select" as const },
      options: TONES,
      table: { defaultValue: { summary: "neutral" } },
    },
    align: {
      control: { type: "select" as const },
      options: ["start", "center"],
      table: { defaultValue: { summary: "start" } },
    },
  },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    tone: "neutral",
    title: "Note",
    children: "Callouts pull attention without stealing the spotlight from the surrounding prose.",
  },
};

export const WithCta: Story = {
  args: {
    tone: "info",
    title: "Want to work together?",
    children: "Currently booking projects for early next quarter.",
    action: <Button>Get in touch</Button>,
  },
};

export const Tones: Story = {
  args: { tone: "neutral", children: "" },
  render: () => (
    <Box css={{ display: "flex", flexDirection: "column", gap: "4" }}>
      {TONES.map((tone) => (
        <Callout key={tone} tone={tone} title={tone[0].toUpperCase() + tone.slice(1)}>
          The quick brown fox jumps over the lazy dog.
        </Callout>
      ))}
    </Box>
  ),
};

export const Centered: Story = {
  args: {
    tone: "brutalist",
    title: "Section break",
    align: "center",
    children: "Centered layout makes a louder visual stop.",
  },
};

export const TitleOnly: Story = {
  args: {
    tone: "warning",
    title: "Heads up — this is shipping soon.",
    children: "",
  },
};
