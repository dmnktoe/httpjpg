import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DiscogsRelease } from "@/lib/integrations/discogs";

import { DiscogsStatus } from "./discogs-status";

const release: DiscogsRelease = {
  title: "Endtroducing.....",
  artist: "DJ Shadow",
  year: "1996",
  format: "Vinyl LP",
  addedAt: "2026-05-01T12:00:00-07:00",
  url: "https://www.discogs.com/release/12345",
  thumb: "https://i.discogs.com/thumb.jpeg",
};

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, json: async () => payload });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("DiscogsStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("holds a loading label, then collapses when the collection is empty", async () => {
    mockFetch({ releases: [] });
    const { container } = render(<DiscogsStatus />);

    expect(screen.getByText("loading ...")).toBeInTheDocument();
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders the newest record with its sleeve", async () => {
    mockFetch({ releases: [release] });
    render(<DiscogsStatus />);

    expect(await screen.findByText("DJ Shadow — Endtroducing.....")).toBeInTheDocument();
    expect(screen.getByText("1996")).toBeInTheDocument();
    expect(screen.getByText("Vinyl LP")).toBeInTheDocument();
    expect(document.querySelector(`img[src="${release.thumb}"]`)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", release.url);
  });

  it("keeps the line unbreakable, letting only the title ellipsize", async () => {
    mockFetch({ releases: [{ ...release, format: 'Vinyl 12"' }] });
    render(<DiscogsStatus />);

    expect(await screen.findByText("DJ Shadow — Endtroducing.....")).toHaveClass("min-w_0");
    expect(screen.getByText('Vinyl 12"')).toHaveClass("flex-sh_0", "white-space_nowrap");
    expect(screen.getByText("1996")).toHaveClass("flex-sh_0");
  });

  it("omits the year and format when they are unknown", async () => {
    mockFetch({ releases: [{ ...release, year: null, format: null }] });
    render(<DiscogsStatus />);

    await screen.findByText("DJ Shadow — Endtroducing.....");
    expect(screen.queryByText("1996")).not.toBeInTheDocument();
    expect(screen.queryByText("Vinyl LP")).not.toBeInTheDocument();
  });

  it("renders nothing when the request fails", async () => {
    mockFetch({}, false);
    const { container } = render(<DiscogsStatus />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders nothing when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(<DiscogsStatus />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
