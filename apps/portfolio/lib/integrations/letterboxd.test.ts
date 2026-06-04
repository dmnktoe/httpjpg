import { beforeEach, type MockedFunction, vi } from "vitest";

import { fetchLetterboxdFilms, isLetterboxdUsername, parseLetterboxdFeed } from "./letterboxd";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function rssResponse(xml: string, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: async () => xml,
  } as Response;
}

const FILM_ITEM = `
  <item>
    <title>Dune: Part Two, 2024 - ★★★★½</title>
    <link>https://letterboxd.com/dom/film/dune-part-two/</link>
    <letterboxd:watchedDate>2024-03-05</letterboxd:watchedDate>
    <letterboxd:rewatch>No</letterboxd:rewatch>
    <letterboxd:filmTitle>Dune: Part Two</letterboxd:filmTitle>
    <letterboxd:filmYear>2024</letterboxd:filmYear>
    <letterboxd:memberRating>4.5</letterboxd:memberRating>
    <description><![CDATA[ <p><img src="https://a.ltrbxd.com/poster.jpg" alt="poster"/></p> <p>Watched on Tuesday.</p> ]]></description>
  </item>`;

function feed(...items: string[]): string {
  return `<?xml version="1.0"?><rss><channel>${items.join("")}</channel></rss>`;
}

describe("parseLetterboxdFeed", () => {
  it("extracts the film fields from a diary item", () => {
    const films = parseLetterboxdFeed(feed(FILM_ITEM));
    expect(films).toHaveLength(1);
    expect(films[0]).toEqual({
      title: "Dune: Part Two",
      year: "2024",
      rating: 4.5,
      rewatch: false,
      watchedDate: "2024-03-05",
      url: "https://letterboxd.com/dom/film/dune-part-two/",
      poster: "https://a.ltrbxd.com/poster.jpg",
    });
  });

  it("skips items without a film title (lists, profile noise)", () => {
    const listItem = `<item><title>My favourites</title><link>https://letterboxd.com/dom/list/x/</link></item>`;
    const films = parseLetterboxdFeed(feed(listItem, FILM_ITEM));
    expect(films).toHaveLength(1);
    expect(films[0].title).toBe("Dune: Part Two");
  });

  it("returns a null rating for unrated entries", () => {
    const unrated = `
      <item>
        <link>https://letterboxd.com/dom/film/the-thing/</link>
        <letterboxd:filmTitle>The Thing</letterboxd:filmTitle>
        <letterboxd:filmYear>1982</letterboxd:filmYear>
      </item>`;
    const films = parseLetterboxdFeed(feed(unrated));
    expect(films[0].rating).toBeNull();
    expect(films[0].poster).toBeNull();
  });

  it("flags rewatches", () => {
    const rewatch = FILM_ITEM.replace(
      "<letterboxd:rewatch>No</letterboxd:rewatch>",
      "<letterboxd:rewatch>Yes</letterboxd:rewatch>",
    );
    const films = parseLetterboxdFeed(feed(rewatch));
    expect(films[0].rewatch).toBe(true);
  });

  it("respects the limit", () => {
    const films = parseLetterboxdFeed(feed(FILM_ITEM, FILM_ITEM, FILM_ITEM), 2);
    expect(films).toHaveLength(2);
  });

  it("returns nothing for a non-positive limit", () => {
    expect(parseLetterboxdFeed(feed(FILM_ITEM), 0)).toEqual([]);
  });
});

describe("fetchLetterboxdFilms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the member RSS feed for the given username", async () => {
    mockFetch.mockResolvedValueOnce(rssResponse(feed(FILM_ITEM)));
    await fetchLetterboxdFilms("dom");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://letterboxd.com/dom/rss/",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("returns parsed films on success", async () => {
    mockFetch.mockResolvedValueOnce(rssResponse(feed(FILM_ITEM)));
    const result = await fetchLetterboxdFilms("dom");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.films[0].title).toBe("Dune: Part Two");
    }
  });

  it("surfaces a non-200 response as a failure", async () => {
    mockFetch.mockResolvedValueOnce(rssResponse("", false, 404));
    const result = await fetchLetterboxdFilms("ghost");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
    }
  });
});

describe("isLetterboxdUsername", () => {
  it("accepts alphanumeric and underscore usernames", () => {
    expect(isLetterboxdUsername("dom")).toBe(true);
    expect(isLetterboxdUsername("dom_123")).toBe(true);
  });

  it("rejects values with slashes, dots, or other unsafe characters", () => {
    expect(isLetterboxdUsername("../etc")).toBe(false);
    expect(isLetterboxdUsername("dom/film")).toBe(false);
    expect(isLetterboxdUsername("dom.user")).toBe(false);
    expect(isLetterboxdUsername("")).toBe(false);
    expect(isLetterboxdUsername(undefined)).toBe(false);
  });
});
