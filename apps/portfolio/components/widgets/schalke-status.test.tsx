import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SchalkeStatus as SchalkeData } from "@/lib/integrations/schalke";

import { SchalkeStatus } from "./schalke-status";

const STATUS: SchalkeData = {
  fixture: {
    home: "Hoffenheim",
    away: "S04",
    homeGoals: 2,
    awayGoals: 1,
    homeCrest: "data:image/png;base64,aG9tZQ==",
    awayCrest: "data:image/png;base64,YXdheQ==",
    outcome: "loss",
    competition: "bl1",
    playedAt: "2026-11-08T18:30:00Z",
  },
  upcoming: null,
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

const UPCOMING = {
  home: "S04",
  away: "Stuttgart",
  homeCrest: "data:image/png;base64,aG9tZQ==",
  awayCrest: null,
  competition: "bl1",
  kickoff: "2026-11-21T17:30:00Z",
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("SchalkeStatus", () => {
  it("holds a loading label until the data arrives", () => {
    render(<SchalkeStatus status={null} loaded={false} />);

    expect(screen.getByText("s04:")).toBeInTheDocument();
    expect(screen.getByText("loading ...")).toBeInTheDocument();
  });

  it("collapses once loaded with nothing to show", () => {
    const { container } = render(
      <SchalkeStatus
        status={{ fixture: null, upcoming: null, standing: null, url: STATUS.url }}
        loaded
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the result between both crests and the position with its trend arrow", () => {
    render(<SchalkeStatus status={STATUS} loaded />);

    expect(screen.getByText("Hoffenheim 2:1 S04")).toBeInTheDocument();
    expect(screen.getByText("17.")).toBeInTheDocument();
    expect(screen.getByText("6 pts")).toBeInTheDocument();

    const crests = [STATUS.fixture!.homeCrest, STATUS.fixture!.awayCrest].map((src) =>
      document.querySelector(`img[src="${src}"]`),
    );
    for (const crest of crests) {
      expect(crest).toBeInTheDocument();
      expect(crest).toHaveStyle({ imageRendering: "pixelated" });
    }

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

  it("leaves a crest out when it could not be loaded", () => {
    const fixture = { ...STATUS.fixture!, homeCrest: null, awayCrest: null };
    render(<SchalkeStatus status={{ ...STATUS, fixture }} loaded />);

    expect(screen.getByText("Hoffenheim 2:1 S04")).toBeInTheDocument();
    expect(document.querySelectorAll("img")).toHaveLength(1);
  });

  it("never draws a remote crest at full size", () => {
    const upcoming = { ...UPCOMING, awayCrest: "https://i.imgur.com/v0tkpNx.png" };
    render(<SchalkeStatus status={{ ...STATUS, fixture: null, upcoming }} loaded />);

    expect(document.querySelector(`img[src="${upcoming.awayCrest}"]`)).not.toBeInTheDocument();
    expect(document.querySelector(`img[src="${UPCOMING.homeCrest}"]`)).toBeInTheDocument();
  });

  it("previews the next match with its weekday and Berlin kickoff time", () => {
    vi.useFakeTimers({ now: new Date("2026-11-16T12:00:00Z") });
    render(<SchalkeStatus status={{ ...STATUS, fixture: null, upcoming: UPCOMING }} loaded />);

    expect(screen.getByText("S04 – Stuttgart")).toBeInTheDocument();
    expect(screen.getByText("Sat 18:30")).toBeInTheDocument();
    expect(document.querySelector(`img[src="${UPCOMING.homeCrest}"]`)).toBeInTheDocument();
    expect(screen.getByText("17.")).toBeInTheDocument();
  });

  it("dates a kickoff more than a week out", () => {
    vi.useFakeTimers({ now: new Date("2026-11-01T12:00:00Z") });
    render(<SchalkeStatus status={{ ...STATUS, fixture: null, upcoming: UPCOMING }} loaded />);

    expect(screen.getByText("21 Nov 18:30")).toBeInTheDocument();
  });

  it("marks a match that has kicked off as live", () => {
    vi.useFakeTimers({ now: new Date("2026-11-21T18:00:00Z") });
    render(<SchalkeStatus status={{ ...STATUS, fixture: null, upcoming: UPCOMING }} loaded />);

    expect(screen.getByText("live")).toBeInTheDocument();
  });

  it("shows the position alone when there is no recent fixture", () => {
    render(<SchalkeStatus status={{ ...STATUS, fixture: null }} loaded />);

    expect(screen.getByText("17.")).toBeInTheDocument();
    expect(screen.queryByText("·")).not.toBeInTheDocument();
  });
});
