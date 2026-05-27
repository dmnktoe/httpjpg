import { Box, CodeBlock } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const SAMPLE_TS = `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      pressed {count} times
    </button>
  );
}`;

const SAMPLE_SH = `pnpm install
pnpm dev`;

const meta = {
  title: "Display/CodeBlock",
  component: CodeBlock,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    code: { control: "text" },
    language: { control: "text" },
    filename: { control: "text" },
    showLineNumbers: { control: "boolean" },
    copyable: { control: "boolean", table: { defaultValue: { summary: "true" } } },
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    code: SAMPLE_TS,
    language: "typescript",
    filename: "counter.tsx",
    showLineNumbers: true,
    copyable: true,
  },
};

export const Plain: Story = {
  args: {
    code: SAMPLE_SH,
    copyable: false,
  },
};

export const WithFilename: Story = {
  args: {
    code: SAMPLE_TS,
    filename: "counter.tsx",
  },
};

export const WithLanguageOnly: Story = {
  args: {
    code: SAMPLE_SH,
    language: "bash",
  },
};

export const WithLineNumbers: Story = {
  args: {
    code: SAMPLE_TS,
    language: "typescript",
    showLineNumbers: true,
  },
};

export const Stacked: Story = {
  args: { code: SAMPLE_TS },
  render: () => (
    <Box css={{ display: "flex", flexDirection: "column", gap: "4" }}>
      <CodeBlock code={SAMPLE_SH} language="bash" filename="terminal" />
      <CodeBlock code={SAMPLE_TS} language="typescript" filename="counter.tsx" showLineNumbers />
    </Box>
  ),
};
