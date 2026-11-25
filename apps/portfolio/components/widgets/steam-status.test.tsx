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
  lastPlayedAt: "2026-11-20T10:00:00.000Z",
  icon: "https://example.com/icon.jpg",
  url: "https://store.steampowered.com/app/1245620/",
};

const status: SteamStatusData = {
  profile: {
    name: "yl33lyxx",
    avatar: "https://example.com/avatar.jpg",
    url: "https://steamcommunity.com/id/dmnktoe/",
    isOnline: false,
    inGame: null,
  },
  games: [game],
};

afterEach(cleanup);

describe("SteamStatus", () => {
  it("holds a loading label until the data arrives", () => {
    render(<SteamStatus status={null} loaded={false} />);

    expect(screen.getByText("loading ...")).toBeInTheDocument();
  });

  it("links the latest game with its icon and fortnight", () => {
    render(<SteamStatus status={status} loaded />);

    expect(screen.getByRole("link")).toHaveAttribute("href", game.url);
    expect(document.querySelector(`img[src="${game.icon}"]`)).toBeInTheDocument();
    expect(screen.getByText("14h / 2w")).toBeInTheDocument();
    expect(screen.queryByLabelText("playing now")).not.toBeInTheDocument();
  });

  it("marks the game that is running now and reports the click", () => {
    render(
      <SteamStatus
        status={{
          ...status,
          profile: { ...status.profile, inGame: { appId: game.appId, name: "x" } },
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

  it("shows lifetime hours for a game played longer ago", () => {
    render(
      <SteamStatus
        status={{ ...status, games: [{ ...game, minutesTwoWeeks: 0, minutesTotal: 18720 }] }}
        loaded
      />,
    );

    expect(screen.getByText("312h total")).toBeInTheDocument();
  });

  it("shows the profile when no game details are public", () => {
    render(
      <SteamStatus
        status={{ ...status, games: [], profile: { ...status.profile, isOnline: true } }}
        loaded
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", status.profile.url);
    expect(screen.getByText("yl33lyxx")).toBeInTheDocument();
    expect(screen.getByText("online")).toBeInTheDocument();
    expect(document.querySelector(`img[src="${status.profile.avatar}"]`)).toBeInTheDocument();
  });

  it("collapses once loaded with nothing to show", () => {
    const { container } = render(
      <SteamStatus
        status={{ ...status, games: [], profile: { ...status.profile, name: "" } }}
        loaded
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
