import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DiscordStatus } from "./discord-status";

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, json: async () => payload });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("DiscordStatus", () => {
  it("holds a loading line until the first response lands", async () => {
    mockFetch({ status: "online" });

    render(<DiscordStatus />);

    // Presence starts unknown, so the line must not claim "offline" first.
    expect(screen.getByText("loading ...")).toBeInTheDocument();
    expect(screen.queryByText("offline")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("online")).toBeInTheDocument());
  });

  it("falls back to offline when the endpoint is unavailable", async () => {
    mockFetch({}, false);

    render(<DiscordStatus />);

    await waitFor(() => expect(screen.getByText("offline")).toBeInTheDocument());
  });

  it("shows the current activity with its playtime", async () => {
    mockFetch({
      status: "dnd",
      activity: "Bloodborne",
      activityDetails: { playtime: "2h 14m", icon: "https://cdn.test/icon.png" },
    });

    render(<DiscordStatus />);

    await waitFor(() => expect(screen.getByText("Bloodborne")).toBeInTheDocument());
    expect(screen.getByText("dnd")).toBeInTheDocument();
    expect(screen.getByText("2h 14m")).toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute("src", "https://cdn.test/icon.png");
  });

  it("omits the activity fields when nothing is being played", async () => {
    mockFetch({ status: "idle", activity: null });

    render(<DiscordStatus />);

    await waitFor(() => expect(screen.getByText("idle")).toBeInTheDocument());
    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
  });

  it("polls for presence changes", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchMock = mockFetch({ status: "online" });

    render(<DiscordStatus />);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await vi.advanceTimersByTimeAsync(30_000);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
