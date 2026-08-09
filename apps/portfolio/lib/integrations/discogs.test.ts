// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

import {
  fetchDiscogsCollection,
  formatArtists,
  formatRelease,
  isDiscogsUsername,
  parseCollection,
} from "./discogs";

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function collectionResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

const ITEM = {
  id: 12345,
  date_added: "2026-05-01T12:00:00-07:00",
  basic_information: {
    id: 12345,
    title: "Endtroducing.....",
    year: 1996,
    thumb: "https://i.discogs.com/thumb.jpeg",
    artists: [{ name: "DJ Shadow" }],
    formats: [{ name: "Vinyl", descriptions: ["LP", "Album"] }],
  },
};

describe("isDiscogsUsername", () => {
  it("accepts the characters Discogs allows", () => {
    expect(isDiscogsUsername("dmnktoe")).toBe(true);
    expect(isDiscogsUsername("crate.digger-99")).toBe(true);
    expect(isDiscogsUsername("a_b")).toBe(true);
  });

  it("rejects values that could reshape the request path", () => {
    expect(isDiscogsUsername("../admin")).toBe(false);
    expect(isDiscogsUsername("user/collection")).toBe(false);
    expect(isDiscogsUsername(".leading-dot")).toBe(false);
    expect(isDiscogsUsername("a")).toBe(false);
    expect(isDiscogsUsername("")).toBe(false);
    expect(isDiscogsUsername(undefined)).toBe(false);
    expect(isDiscogsUsername(42)).toBe(false);
  });
});

describe("formatArtists", () => {
  it("strips the Discogs disambiguation suffix", () => {
    expect(formatArtists([{ name: "Sound (3)" }])).toBe("Sound");
  });

  it("prefers the artist name variation when present", () => {
    expect(formatArtists([{ name: "DJ Shadow", anv: "Shadow" }])).toBe("Shadow");
  });

  it("joins a pair and summarises longer line-ups", () => {
    expect(formatArtists([{ name: "A" }, { name: "B" }])).toBe("A & B");
    expect(formatArtists([{ name: "A" }, { name: "B" }, { name: "C" }])).toBe("A & others");
  });

  it("falls back when no usable name is present", () => {
    expect(formatArtists([])).toBe("Unknown Artist");
    expect(formatArtists(undefined)).toBe("Unknown Artist");
    expect(formatArtists([{ name: "  " }])).toBe("Unknown Artist");
  });
});

describe("formatRelease", () => {
  it("combines the format with its first description", () => {
    expect(formatRelease({ name: "Vinyl", descriptions: ["LP", "Album"] })).toBe("Vinyl LP");
  });

  it("returns the bare format without descriptions", () => {
    expect(formatRelease({ name: "Cassette" })).toBe("Cassette");
    expect(formatRelease({ name: "Cassette", descriptions: [] })).toBe("Cassette");
  });

  it("returns null without a format", () => {
    expect(formatRelease(undefined)).toBeNull();
    expect(formatRelease({})).toBeNull();
  });
});

describe("parseCollection", () => {
  it("maps a collection item onto the release shape", () => {
    expect(parseCollection({ releases: [ITEM] })).toEqual([
      {
        title: "Endtroducing.....",
        artist: "DJ Shadow",
        year: "1996",
        format: "Vinyl LP",
        addedAt: "2026-05-01T12:00:00-07:00",
        url: "https://www.discogs.com/release/12345",
        thumb: "https://i.discogs.com/thumb.jpeg",
      },
    ]);
  });

  it("keeps the order the API returned", () => {
    const older = { ...ITEM, id: 999, basic_information: { ...ITEM.basic_information, id: 999 } };
    const releases = parseCollection({ releases: [ITEM, older] });
    expect(releases.map((release) => release.url)).toEqual([
      "https://www.discogs.com/release/12345",
      "https://www.discogs.com/release/999",
    ]);
  });

  it("falls back to the cover image and drops a zero year", () => {
    const release = parseCollection({
      releases: [
        {
          ...ITEM,
          basic_information: {
            ...ITEM.basic_information,
            year: 0,
            thumb: "",
            cover_image: "https://i.discogs.com/cover.jpeg",
          },
        },
      ],
    })[0];

    expect(release.year).toBeNull();
    expect(release.thumb).toBe("https://i.discogs.com/cover.jpeg");
  });

  it("skips items without a title or an id", () => {
    expect(parseCollection({ releases: [{ basic_information: { title: "No id" } }] })).toEqual([]);
    expect(parseCollection({ releases: [{ id: 1, basic_information: {} }] })).toEqual([]);
  });

  it("handles an empty or missing releases array", () => {
    expect(parseCollection({})).toEqual([]);
    expect(parseCollection({ releases: [] })).toEqual([]);
  });

  it("respects the limit", () => {
    expect(parseCollection({ releases: [ITEM, ITEM] }, 1)).toHaveLength(1);
    expect(parseCollection({ releases: [ITEM] }, 0)).toEqual([]);
  });
});

describe("fetchDiscogsCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the newest additions with a User-Agent", async () => {
    mockFetch.mockResolvedValueOnce(collectionResponse({ releases: [ITEM] }));

    await fetchDiscogsCollection("dmnktoe");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.discogs.com/users/dmnktoe/collection/folders/0/releases?sort=added&sort_order=desc&per_page=4",
      expect.objectContaining({
        headers: expect.objectContaining({ "User-Agent": expect.stringContaining("httpjpg") }),
      }),
    );
  });

  it("returns parsed releases on success", async () => {
    mockFetch.mockResolvedValueOnce(collectionResponse({ releases: [ITEM] }));

    const result = await fetchDiscogsCollection("dmnktoe");

    expect(result).toMatchObject({ ok: true, releases: [{ title: "Endtroducing....." }] });
  });

  it("surfaces a private collection as the upstream status", async () => {
    mockFetch.mockResolvedValueOnce(collectionResponse("", false, 404));

    const result = await fetchDiscogsCollection("dmnktoe");

    expect(result).toMatchObject({ ok: false, status: 404 });
    if (!result.ok) {
      expect(result.message).toContain("collection is public");
    }
  });

  it("reports a timeout as a 504", async () => {
    mockFetch.mockRejectedValueOnce(new DOMException("aborted", "AbortError"));

    const result = await fetchDiscogsCollection("dmnktoe");

    expect(result).toEqual({ ok: false, status: 504, message: "Discogs request timed out." });
  });

  it("reports a malformed body as a 502", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    } as unknown as Response);

    const result = await fetchDiscogsCollection("dmnktoe");

    expect(result).toEqual({ ok: false, status: 502, message: "Malformed Discogs response." });
  });
});
