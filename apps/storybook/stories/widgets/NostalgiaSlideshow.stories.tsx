import type { Meta, StoryObj } from "@storybook/react";

import { NostalgiaSlideshow } from "@/components/ui/nostalgia-slideshow";

const meta = {
  title: "Widgets/NostalgiaSlideshow",
  component: NostalgiaSlideshow,
  parameters: {
    layout: "fullscreen",
    // Autoplaying flip transition isn't snapshot-stable.
    chromatic: { disableSnapshot: true },
    docs: {
      description: {
        component:
          "Flipping slideshow of nostalgic software icons, fixed to the bottom-left of the viewport on `lg` and up. Images are served from the portfolio's public assets.",
      },
    },
  },
  tags: ["autodocs"],
  // A `transform` on the wrapper contains the slideshow's `position: fixed`.
  decorators: [
    (Story) => (
      <div style={{ position: "relative", transform: "translateZ(0)", minHeight: 200 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NostalgiaSlideshow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
