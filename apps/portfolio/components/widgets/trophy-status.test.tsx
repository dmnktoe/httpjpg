import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PsnTrophy } from "@/lib/integrations/psn-trophies";

import { TrophyStatus } from "./trophy-status";

const trophyA: PsnTrophy = {
  name: "Power Couple",
  game: "It Takes Two",
  platform: "PS5",
  type: "platinum",
  description: "You are unstoppable!",
  earnedAt: "2026-01-25T01:26:14.000Z",
  url: "https://psnprofiles.com/bullensohn6",
  image: "https://image.api.playstation.com/trophyA.png",
};

const trophyB: PsnTrophy = {
  ...trophyA,
  name: "First Step",
  game: "Returnal",
  type: "bronze",
  image: "https://image.api.playstation.com/trophyB.png",
};

const AVATAR = "https://avatar.test/l.png";

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => payload,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("TrophyStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows a loading label while loading, then collapses when there are no trophies", async () => {
    mockFetch({ trophies: [], avatar: null });
    const { container } = render(<TrophyStatus />);
    expect(screen.getByText("loading ...")).toBeInTheDocument();
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders only the latest trophy with its tier sprite and image", async () => {
    mockFetch({ trophies: [trophyA, trophyB], avatar: AVATAR });
    render(<TrophyStatus />);

    await screen.findByText(trophyA.name);
    expect(screen.queryByText(trophyB.name)).not.toBeInTheDocument();

    const sprite = screen.getByAltText("platinum trophy");
    expect(sprite).toHaveAttribute("src", "/images/trophies/platinum.png");
    expect(sprite).toHaveStyle({ imageRendering: "pixelated" });

    expect(document.querySelector(`img[src="${trophyA.image}"]`)).toBeInTheDocument();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", trophyA.url);
  });

  it("renders the PSN avatar and no hover preview", async () => {
    mockFetch({ trophies: [trophyA, trophyB], avatar: AVATAR });
    render(<TrophyStatus />);

    await screen.findByText(trophyA.name);
    expect(document.querySelector(`img[src="${AVATAR}"]`)).toBeInTheDocument();
    expect(document.querySelectorAll("[data-preview-image]")).toHaveLength(0);
  });

  it("renders nothing when the request fails", async () => {
    mockFetch({}, false);
    const { container } = render(<TrophyStatus />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
