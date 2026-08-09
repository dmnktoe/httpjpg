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
 * Reads as an inline link. The shortcut resolves after mount — `⌘+𝙆` on Apple
 * platforms, `^+𝙆` elsewhere, and the word label on a coarse pointer, where
 * there is no keyboard to press.
 */
export const Playground: Story = {};

export const CustomTouchLabel: Story = {
  args: { label: "search or ask" },
};

/** In the nav's decorative line, which is where it actually lives. */
export const InNavLine: Story = {
  render: (args) => (
    <Box
      css={{
        w: "24rem",
        p: "4",
        fontSize: "sm",
        lineHeight: "snug",
        border: "1px dashed",
        borderColor: "pageBorder",
      }}
    >
      <Box as="span">
        —————— ꀭꉣꁅ! :))))) ･ﾟ⋆ 🎀 𝒽𝓊𝒽𝓊𝓊𝓊 𝒽𝓉𝓉𝓅 &&& —————— 𝒿𝓅𝑔❣ 𝓈(^‿^)-𝒷))){" "}
        <SearchTrigger {...args} />
      </Box>
    </Box>
  ),
};
