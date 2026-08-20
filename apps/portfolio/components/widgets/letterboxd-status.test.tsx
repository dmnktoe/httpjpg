import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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

afterEach(cleanup);

describe("LetterboxdStatus", () => {
  it("holds a loading label until the data arrives", () => {
    render(<LetterboxdStatus film={null} loaded={false} />);

    // A loading line holds the footer in place during the request.
    expect(screen.getByText("loading ...")).toBeInTheDocument();
  });

  it("collapses once loaded with no film", () => {
    const { container } = render(<LetterboxdStatus film={null} loaded />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the latest film with its poster but no hover preview", () => {
    render(<LetterboxdStatus film={film} loaded />);

    const poster = document.querySelector(`img[src="${film.poster}"]`);
    expect(poster).toBeInTheDocument();
    expect(document.querySelectorAll("[data-preview-image]")).toHaveLength(0);

    expect(screen.getByRole("link")).toHaveAttribute("href", film.url);
  });

  it("formats half-star ratings", () => {
    render(<LetterboxdStatus film={film} loaded />);

    expect(screen.getByText("★★★★½")).toBeInTheDocument();
  });

  it("formats whole-star ratings without a half step", () => {
    render(<LetterboxdStatus film={{ ...film, rating: 3 }} loaded />);

    expect(screen.getByText("★★★")).toBeInTheDocument();
  });

  it("omits the rating when none is present", () => {
    render(<LetterboxdStatus film={{ ...film, rating: null }} loaded />);

    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });

  it("renders the liked heart when the film is liked", () => {
    render(<LetterboxdStatus film={{ ...film, liked: true }} loaded />);

    expect(screen.getByLabelText("liked")).toBeInTheDocument();
  });

  it("keeps the line unbreakable, letting only the title ellipsize", () => {
    render(<LetterboxdStatus film={{ ...film, liked: true }} loaded />);

    expect(screen.getByText(film.title)).toHaveClass("min-w_0");
    expect(screen.getByText("★★★★½")).toHaveClass("flex-sh_0", "white-space_nowrap");
    expect(screen.getByText("2001")).toHaveClass("flex-sh_0");
    expect(screen.getByLabelText("liked")).toHaveClass("flex-sh_0");
  });
});
