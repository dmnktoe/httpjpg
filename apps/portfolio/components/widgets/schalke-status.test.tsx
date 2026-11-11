import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { SchalkeStatus as SchalkeData } from "@/lib/integrations/schalke";

import { SchalkeStatus } from "./schalke-status";

const STATUS: SchalkeData = {
  fixture: {
    home: "Hoffenheim",
    away: "S04",
    homeGoals: 2,
    awayGoals: 1,
    outcome: "loss",
    competition: "bl1",
    playedAt: "2026-11-08T18:30:00Z",
  },
  standing: {
    position: 17,
    previousPosition: 16,
    trend: "down",
    points: 6,
    teams: 18,
    league: "bl1",
  },
  url: "https://schalke04.de",
};

afterEach(cleanup);

describe("SchalkeStatus", () => {
  it("holds a loading label until the data arrives", () => {
    render(<SchalkeStatus status={null} loaded={false} />);

    expect(screen.getByText("s04:")).toBeInTheDocument();
    expect(screen.getByText("loading ...")).toBeInTheDocument();
  });

  it("collapses once loaded with nothing to show", () => {
    const { container } = render(
      <SchalkeStatus status={{ fixture: null, standing: null, url: STATUS.url }} loaded />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the result with its outcome dot and the position with its trend arrow", () => {
    render(<SchalkeStatus status={STATUS} loaded />);

    expect(screen.getByText("Hoffenheim 2:1 S04")).toBeInTheDocument();
    expect(screen.getByText("17.")).toBeInTheDocument();
    expect(screen.getByText("6 pts")).toBeInTheDocument();

    const dot = screen.getByAltText("loss");
    expect(dot).toHaveAttribute("src", "/images/football/loss.png");
    expect(dot).toHaveStyle({ imageRendering: "pixelated" });

    const arrow = screen.getByAltText("down from 16.");
    expect(arrow).toHaveAttribute("src", "/images/football/down.png");
    expect(arrow).toHaveStyle({ imageRendering: "pixelated" });

    expect(screen.getByRole("link")).toHaveAttribute("href", STATUS.url);
  });

  it("marks an unchanged position with the neutral sprite", () => {
    const standing = { ...STATUS.standing!, previousPosition: 17, trend: "same" as const };
    render(<SchalkeStatus status={{ ...STATUS, standing }} loaded />);

    expect(screen.getByAltText("unchanged")).toHaveAttribute("src", "/images/football/same.png");
  });

  it("shows the position alone when there is no recent fixture", () => {
    render(<SchalkeStatus status={{ ...STATUS, fixture: null }} loaded />);

    expect(screen.getByText("17.")).toBeInTheDocument();
    expect(screen.queryByText("·")).not.toBeInTheDocument();
  });
});
