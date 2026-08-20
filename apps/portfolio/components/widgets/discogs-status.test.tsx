import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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

afterEach(cleanup);

describe("DiscogsStatus", () => {
  it("holds a loading label until the data arrives", () => {
    render(<DiscogsStatus release={null} loaded={false} />);

    expect(screen.getByText("loading ...")).toBeInTheDocument();
  });

  it("collapses once loaded with an empty collection", () => {
    const { container } = render(<DiscogsStatus release={null} loaded />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the newest record with its sleeve", () => {
    render(<DiscogsStatus release={release} loaded />);

    expect(screen.getByText("DJ Shadow — Endtroducing.....")).toBeInTheDocument();
    expect(screen.getByText("1996")).toBeInTheDocument();
    expect(screen.getByText("Vinyl LP")).toBeInTheDocument();
    expect(document.querySelector(`img[src="${release.thumb}"]`)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", release.url);
  });

  it("keeps the line unbreakable, letting only the title ellipsize", () => {
    render(<DiscogsStatus release={{ ...release, format: 'Vinyl 12"' }} loaded />);

    expect(screen.getByText("DJ Shadow — Endtroducing.....")).toHaveClass("min-w_0");
    expect(screen.getByText('Vinyl 12"')).toHaveClass("flex-sh_0", "white-space_nowrap");
    expect(screen.getByText("1996")).toHaveClass("flex-sh_0");
  });

  it("omits the year and format when they are unknown", () => {
    render(<DiscogsStatus release={{ ...release, year: null, format: null }} loaded />);

    expect(screen.getByText("DJ Shadow — Endtroducing.....")).toBeInTheDocument();
    expect(screen.queryByText("1996")).not.toBeInTheDocument();
    expect(screen.queryByText("Vinyl LP")).not.toBeInTheDocument();
  });
});
