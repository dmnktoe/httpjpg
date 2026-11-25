import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { SteamGame, SteamStatus as SteamStatusData } from "@/lib/integrations/steam";

const { trackOutboundClick } = vi.hoisted(() => ({ trackOutboundClick: vi.fn() }));
vi.mock("@httpjpg/analytics", () => ({ trackOutboundClick }));

import { SteamStatus } from "./steam-status";

const game: SteamGame = {
  appId: 1245620,
  name: "ELDEN RING",
  minutesTwoWeeks: 845,
  minutesTotal: 9000,
  icon: "https://example.com/icon.jpg",
  url: "https://store.steampowered.com/app/1245620/",
};

const status: SteamStatusData = {
  profile: { name: "dmnktoe", avatar: null, url: "https://steam.test/p", inGame: null },
  games: [game],
};

afterEach(cleanup);

describe("SteamStatus", () => {
  it("holds a loading label, then collapses without games", () => {
    const { rerender, container } = render(<SteamStatus status={null} loaded={false} />);
    expect(screen.getByText("loading ...")).toBeInTheDocument();

    rerender(<SteamStatus status={{ ...status, games: [] }} loaded />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links the most played game with its icon and playtime", () => {
    render(<SteamStatus status={status} loaded />);

    expect(screen.getByRole("link")).toHaveAttribute("href", game.url);
    expect(document.querySelector(`img[src="${game.icon}"]`)).toBeInTheDocument();
    expect(screen.getByLabelText("845 minutes in the last two weeks")).toHaveTextContent(
      "14h / 2w",
    );
    expect(screen.queryByLabelText("playing now")).not.toBeInTheDocument();
  });

  it("marks the game that is running now and reports the click", () => {
    render(
      <SteamStatus
        status={{
          ...status,
          profile: { ...status.profile, inGame: { appId: 1245620, name: "x" } },
        }}
        loaded
      />,
    );

    expect(screen.getByLabelText("playing now")).toBeInTheDocument();
    screen.getByRole("link").click();
    expect(trackOutboundClick).toHaveBeenCalledWith({
      destination: "steam",
      href: game.url,
      label: "ELDEN RING",
    });
  });

  it("prints short sessions in minutes and drops an empty playtime", () => {
    const { rerender } = render(
      <SteamStatus status={{ ...status, games: [{ ...game, minutesTwoWeeks: 45 }] }} loaded />,
    );
    expect(screen.getByText("45m / 2w")).toBeInTheDocument();

    rerender(
      <SteamStatus status={{ ...status, games: [{ ...game, minutesTwoWeeks: 0 }] }} loaded />,
    );
    expect(screen.queryByText(/\/ 2w/)).not.toBeInTheDocument();
  });
});
