import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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

afterEach(cleanup);

describe("TrophyStatus", () => {
  it("holds a loading label until the data arrives", () => {
    render(<TrophyStatus trophy={null} avatar={null} loaded={false} />);

    expect(screen.getByText("loading ...")).toBeInTheDocument();
  });

  it("collapses once loaded with no trophies", () => {
    const { container } = render(<TrophyStatus trophy={null} avatar={null} loaded />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the trophy with its tier sprite and image", () => {
    render(<TrophyStatus trophy={trophyA} avatar={AVATAR} loaded />);

    expect(screen.getByText(trophyA.name)).toBeInTheDocument();
    expect(screen.queryByText(trophyB.name)).not.toBeInTheDocument();

    const sprite = screen.getByAltText("platinum trophy");
    expect(sprite).toHaveAttribute("src", "/images/trophies/platinum.png");
    expect(sprite).toHaveStyle({ imageRendering: "pixelated" });

    expect(document.querySelector(`img[src="${trophyA.image}"]`)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", trophyA.url);
  });

  it("renders the PSN avatar and no hover preview", () => {
    render(<TrophyStatus trophy={trophyA} avatar={AVATAR} loaded />);

    expect(document.querySelector(`img[src="${AVATAR}"]`)).toBeInTheDocument();
    expect(document.querySelectorAll("[data-preview-image]")).toHaveLength(0);
  });

  it("renders without an avatar when PSN did not return one", () => {
    render(<TrophyStatus trophy={trophyA} avatar={null} loaded />);

    expect(document.querySelector(`img[src="${AVATAR}"]`)).not.toBeInTheDocument();
    expect(screen.getByText(trophyA.name)).toBeInTheDocument();
  });
});
