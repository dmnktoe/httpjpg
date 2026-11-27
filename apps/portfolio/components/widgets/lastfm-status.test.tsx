import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { LastfmTrack } from "@/lib/integrations/lastfm";

const { trackOutboundClick } = vi.hoisted(() => ({ trackOutboundClick: vi.fn() }));
vi.mock("@httpjpg/analytics", () => ({ trackOutboundClick }));

import { LastfmStatus } from "./lastfm-status";

const track: LastfmTrack = {
  title: "Teardrop",
  artist: "Massive Attack",
  album: "Mezzanine",
  url: "https://www.last.fm/music/Massive+Attack/_/Teardrop",
  image: "https://example.com/cover.jpg",
  nowPlaying: false,
  loved: false,
  scrobbledAt: "2026-11-24T16:00:00.000Z",
};

afterEach(cleanup);

describe("LastfmStatus", () => {
  it("holds a loading label until the data arrives", () => {
    render(<LastfmStatus track={null} loaded={false} />);

    expect(screen.getByText("loading ...")).toBeInTheDocument();
  });

  it("collapses once loaded with no scrobble", () => {
    const { container } = render(<LastfmStatus track={null} loaded />);

    expect(container).toBeEmptyDOMElement();
  });

  it("links the latest scrobble with its cover, title and artist", () => {
    render(<LastfmStatus track={track} loaded />);

    expect(screen.getByRole("link")).toHaveAttribute("href", track.url);
    expect(document.querySelector(`img[src="${track.image}"]`)).toBeInTheDocument();
    expect(screen.getByText("Teardrop")).toBeInTheDocument();
    expect(screen.getByText("Massive Attack")).toBeInTheDocument();
  });

  it("reports the outbound click", () => {
    render(<LastfmStatus track={track} loaded />);

    screen.getByRole("link").click();

    expect(trackOutboundClick).toHaveBeenCalledWith({
      destination: "lastfm",
      href: track.url,
      label: "Massive Attack – Teardrop",
    });
  });

  it("marks a track that is playing right now", () => {
    const { rerender } = render(<LastfmStatus track={track} loaded />);
    expect(screen.queryByLabelText("now playing")).not.toBeInTheDocument();

    rerender(<LastfmStatus track={{ ...track, nowPlaying: true }} loaded />);
    expect(screen.getByLabelText("now playing")).toBeInTheDocument();
    expect(screen.getByText("Teardrop").getAttribute("style")).toContain("accent-400");
  });

  it("marks loved tracks", () => {
    render(<LastfmStatus track={{ ...track, loved: true }} loaded />);

    expect(screen.getByLabelText("loved")).toBeInTheDocument();
  });

  it("shows the lifetime scrobble count compactly", () => {
    render(<LastfmStatus track={track} total={48213} loaded />);

    expect(screen.getByLabelText("48213 scrobbles")).toHaveTextContent("48.2K");
  });

  it("leaves out the count and draws a note when there is no cover", () => {
    render(<LastfmStatus track={{ ...track, image: null }} loaded />);

    expect(screen.queryByLabelText(/scrobbles/)).not.toBeInTheDocument();
    expect(document.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("♪")).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps the line unbreakable, letting only title and artist ellipsize", () => {
    render(<LastfmStatus track={{ ...track, nowPlaying: true }} total={1200} loaded />);

    expect(screen.getByText("Teardrop").parentElement).toHaveClass("jpg-min-w_0");
    expect(screen.getByText("Massive Attack")).toHaveClass("jpg-min-w_0");
    expect(screen.getByLabelText("now playing")).toHaveClass("jpg-flex-sh_0");
    expect(screen.getByLabelText("1200 scrobbles")).toHaveClass("jpg-flex-sh_0");
  });
});
