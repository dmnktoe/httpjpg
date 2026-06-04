import type { Meta, StoryObj } from "@storybook/react";

import { LetterboxdStatus } from "@/components/widgets/letterboxd-status";

import { withMockJson } from "../shared/mock-fetch";

const POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='60'%3E%3Crect width='40' height='60' fill='%2300e054'/%3E%3C/svg%3E";

function film(overrides: Record<string, unknown> = {}) {
  return {
    title: "Dune: Part Two",
    year: "2024",
    rating: 4.5,
    rewatch: false,
    watchedDate: "2024-03-05",
    url: "https://letterboxd.com/dom/film/dune-part-two/",
    poster: POSTER,
    ...overrides,
  };
}

const meta = {
  title: "Widgets/LetterboxdStatus",
  component: LetterboxdStatus,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Footer line showing the most recently watched film from the Letterboxd RSS feed (`/api/letterboxd`). Stories mock the API response. Each story mounts in isolation so the per-story mock applies cleanly.",
      },
    },
  },
} satisfies Meta<typeof LetterboxdStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Rated: Story = {
  decorators: [withMockJson("/api/letterboxd", { films: [film()] })],
};

export const Unrated: Story = {
  decorators: [withMockJson("/api/letterboxd", { films: [film({ rating: null })] })],
};

export const NoPoster: Story = {
  decorators: [withMockJson("/api/letterboxd", { films: [film({ poster: null })] })],
};

export const LongTitle: Story = {
  decorators: [
    withMockJson("/api/letterboxd", {
      films: [film({ title: "The Lord of the Rings: The Return of the King", year: "2003" })],
    }),
  ],
};
