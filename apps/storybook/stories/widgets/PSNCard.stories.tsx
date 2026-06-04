import type { Meta, StoryObj } from "@storybook/react";

import { PSNCard } from "@/components/widgets/psn-card";

const meta = {
  title: "Widgets/PSNCard",
  component: PSNCard,
  parameters: {
    layout: "fullscreen",
    // The card is a live image from psnprofiles.com; skip visual snapshots.
    chromatic: { disableSnapshot: true },
    docs: {
      description: {
        component:
          "PlayStation trophy card pulled from psnprofiles.com. Fixed to the top-left of the viewport on `lg` and up; the story wraps it in a positioned container so it stays inside the canvas.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    username: { control: "text", description: "PSN username" },
  },
  args: {
    username: "dmnktoe",
  },
  // A `transform` on the wrapper makes the card's `position: fixed` resolve
  // against this box instead of the viewport.
  decorators: [
    (Story) => (
      <div style={{ position: "relative", transform: "translateZ(0)", minHeight: 200 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PSNCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
