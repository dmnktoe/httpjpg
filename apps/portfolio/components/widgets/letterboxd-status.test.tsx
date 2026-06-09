import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LetterboxdFilm } from "@/lib/integrations/letterboxd";

import { LetterboxdStatus } from "./letterboxd-status";

const film: LetterboxdFilm = {
  title: "Mulholland Drive",
  year: "2001",
  rating: 4.5,
  rewatch: false,
  liked: false,
  watchedDate: "2026-05-01",
  url: "https://letterboxd.com/user/film/mulholland-drive/",
  poster: "https://example.com/poster.jpg",
};

function mockFetch(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => payload,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("LetterboxdStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows a loading label while loading, then collapses when there is no film", async () => {
    mockFetch({ films: [] });
    const { container } = render(<LetterboxdStatus />);
    // A loading line holds the footer in place during the request.
    expect(screen.getByText("loading ...")).toBeInTheDocument();
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders the latest film with its poster but no hover preview", async () => {
    mockFetch({ films: [film] });
    render(<LetterboxdStatus />);

    await screen.findByText(film.title);

    const poster = document.querySelector(`img[src="${film.poster}"]`);
    expect(poster).toBeInTheDocument();
    expect(document.querySelectorAll("[data-preview-image]")).toHaveLength(0);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", film.url);
  });

  it("formats half-star ratings", async () => {
    mockFetch({ films: [film] });
    render(<LetterboxdStatus />);

    expect(await screen.findByText("★★★★½")).toBeInTheDocument();
  });

  it("formats whole-star ratings without a half step", async () => {
    mockFetch({ films: [{ ...film, rating: 3 }] });
    render(<LetterboxdStatus />);

    expect(await screen.findByText("★★★")).toBeInTheDocument();
  });

  it("omits the rating when none is present", async () => {
    mockFetch({ films: [{ ...film, rating: null }] });
    render(<LetterboxdStatus />);

    await screen.findByText(film.title);
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });

  it("renders the liked heart when the film is liked", async () => {
    mockFetch({ films: [{ ...film, liked: true }] });
    render(<LetterboxdStatus />);

    expect(await screen.findByLabelText("liked")).toBeInTheDocument();
  });

  it("renders nothing when the request fails", async () => {
    mockFetch({}, false);
    const { container } = render(<LetterboxdStatus />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
