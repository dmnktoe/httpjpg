import type { Meta, StoryObj } from "@storybook/react";

import { DiscordStatus } from "@/components/widgets/discord-status";

import { withMockJson } from "../shared/mock-fetch";

// Inline SVG keeps the activity icon deterministic and offline.
const GAME_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='%235865F2'/%3E%3C/svg%3E";

const meta = {
  title: "Widgets/DiscordStatus",
  component: DiscordStatus,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Footer presence line backed by the Lanyard API (`/api/discord`). Stories mock the API response to show each presence state.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DiscordStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Online: Story = {
  decorators: [withMockJson({ status: "online", activity: null, activityDetails: null })],
};

export const PlayingGame: Story = {
  decorators: [
    withMockJson({
      status: "online",
      activity: "Playing Helldivers 2 on PS5",
      activityDetails: { playtime: "2h 14m", icon: GAME_ICON },
    }),
  ],
};

export const Idle: Story = {
  decorators: [withMockJson({ status: "idle", activity: null, activityDetails: null })],
};

export const DoNotDisturb: Story = {
  decorators: [withMockJson({ status: "dnd", activity: null, activityDetails: null })],
};

export const Offline: Story = {
  decorators: [withMockJson({ status: "offline", activity: null, activityDetails: null })],
};
