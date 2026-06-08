import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const useNowPlaying = vi.fn();

vi.mock("@httpjpg/analytics", () => ({
  trackNowPlayingClick: vi.fn(),
}));

vi.mock("@httpjpg/spotify", () => ({
  useNowPlaying: (...args: unknown[]) => useNowPlaying(...args),
}));

vi.mock("@httpjpg/now-playing", () => ({
  NowPlaying: ({ title, artist }: { title?: string; artist?: string }) => (
    <div>
      <span>{title}</span>
      <span>{artist}</span>
    </div>
  ),
}));

import { NowPlayingWidget } from "./now-playing-widget";

describe("NowPlayingWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the premium-missing danger state on a 403", async () => {
    useNowPlaying.mockReturnValue({ data: null, isLoading: false, errorCode: "premium_missing" });

    render(<NowPlayingWidget />);

    expect(await screen.findByText(/premium missing/)).toBeInTheDocument();
  });

  it("renders a generic error state for other failures", async () => {
    useNowPlaying.mockReturnValue({ data: null, isLoading: false, errorCode: "internal_error" });

    render(<NowPlayingWidget />);

    expect(await screen.findByText(/error 500/)).toBeInTheDocument();
  });

  it("renders the current track when playing", async () => {
    useNowPlaying.mockReturnValue({
      data: { title: "Song", artist: "Artist", artwork: "x", isPlaying: true },
      isLoading: false,
      errorCode: null,
    });

    render(<NowPlayingWidget />);

    expect(await screen.findByText("Song")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
  });
});
