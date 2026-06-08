import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PsnTrophy } from "@/lib/integrations/psn-trophies";

import { TrophyStatus } from "./trophy-status";

const trophy: PsnTrophy = {
  name: "Power Couple",
  game: "It Takes Two",
  platform: "PS5",
  type: "platinum",
  description: "You are unstoppable, nothing stands in your way!",
  earnedAt: "2026-01-25T01:26:14.000Z",
  url: "https://psntrophyleaders.com/user/view/bullensohn6/it-takes-two-ps5/1",
  avatar: "https://static-resource.np.community.playstation.net/avatar/3RD/30004.png",
};

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

  it("shows a loading label while loading, then collapses when there is no trophy", async () => {
    mockFetch({ trophies: [] });
    const { container } = render(<TrophyStatus />);
    expect(screen.getByText("loading ...")).toBeInTheDocument();
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders the latest trophy with its tier sprite, game, and platform", async () => {
    mockFetch({ trophies: [trophy] });
    render(<TrophyStatus />);

    const name = await screen.findByText(trophy.name);
    expect(name).toHaveAttribute("data-preview-image", "/images/trophies/platinum.png");

    expect(screen.getByText(trophy.game)).toBeInTheDocument();
    expect(screen.getByText("PS5")).toBeInTheDocument();

    const icon = screen.getByAltText("platinum trophy");
    expect(icon).toHaveAttribute("src", "/images/trophies/platinum.png");
    expect(icon).toHaveStyle({ imageRendering: "pixelated" });

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", trophy.url);
  });

  it("renders the pixelated avatar when present", async () => {
    mockFetch({ trophies: [trophy] });
    render(<TrophyStatus />);

    await screen.findByText(trophy.name);
    const avatar = document.querySelector(`img[src="${trophy.avatar}"]`);
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveStyle({ imageRendering: "pixelated" });
  });

  it("renders nothing when the request fails", async () => {
    mockFetch({}, false);
    const { container } = render(<TrophyStatus />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
