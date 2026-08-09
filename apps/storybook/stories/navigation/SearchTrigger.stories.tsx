import { Box, SearchTrigger } from "@httpjpg/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Navigation/SearchTrigger",
  component: SearchTrigger,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "search",
  },
  argTypes: {
    label: { control: "text" },
    onTrigger: {
      description:
        "Overrides the default `openSearch` window event. Left unset, the palette listens for it.",
    },
  },
} satisfies Meta<typeof SearchTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The shortcut hint resolves after mount — `⌘K` on Apple platforms, `^K`
 * elsewhere, and nothing at all on a coarse pointer, where there is no keyboard
 * to press.
 */
export const Playground: Story = {};

export const CustomLabel: Story = {
  args: { label: "search or ask" },
};

/** How it sits in the header row, pushed to the right of the navigation. */
export const InHeaderRow: Story = {
  render: (args) => (
    <Box
      css={{
        display: "flex",
        alignItems: "center",
        gap: "6",
        w: "480px",
        p: "4",
        fontFamily: "mono",
        fontSize: "sm",
        border: "1px dashed",
        borderColor: "pageBorder",
      }}
    >
      <Box as="span" css={{ fontWeight: "bold" }}>
        ⇝HE𝓁𝓁O
      </Box>
      <Box as="span" css={{ opacity: 0.6 }}>
        work
      </Box>
      <Box as="span" css={{ opacity: 0.6 }}>
        about
      </Box>
      <SearchTrigger {...args} css={{ ml: "auto" }} />
    </Box>
  ),
};
