// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

import { fetchLastfmScrobbles, isLastfmUsername, parseRecentTracks } from "./lastfm";
import { pixelateEach } from "./pixelate";

vi.mock("./pixelate", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./pixelate")>()),
  pixelateImage: vi.fn(async (source: string | null | undefined) => source ?? null),
  pixelateEach: vi.fn(async (items: unknown[]) => items),
}));

global.fetch = vi.fn() as MockedFunction<typeof fetch>;
const mockFetch = global.fetch as MockedFunction<typeof fetch>;

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

const TRACK = {
  name: "Teardrop",
  url: "https://www.last.fm/music/Massive+Attack/_/Teardrop",
  loved: "0",
  artist: { name: "Massive Attack", url: "https://www.last.fm/music/Massive+Attack" },
  album: { "#text": "Mezzanine" },
  image: [
    { size: "small", "#text": "https://lastfm.freetls.fastly.net/i/u/34s/a.jpg" },
    { size: "extralarge", "#text": "https://lastfm.freetls.fastly.net/i/u/300x300/a.jpg" },
  ],
  date: { uts: "1764000000", "#text": "24 Nov 2025, 16:00" },
};

const NOW_PLAYING = {
  ...TRACK,
  name: "Angel",
  date: undefined,
  "@attr": { nowplaying: "true" },
};

type RecentTracksBody = Parameters<typeof parseRecentTracks>[0];

function recent(track: unknown, total = "48213"): RecentTracksBody {
  return { recenttracks: { track, "@attr": { total } } } as RecentTracksBody;
}

describe("parseRecentTracks", () => {
  it("maps a scrobble to the widget shape", () => {
    const { tracks, total } = parseRecentTracks(recent([TRACK]));

    expect(total).toBe(48213);
    expect(tracks).toEqual([
      {
        title: "Teardrop",
        artist: "Massive Attack",
        album: "Mezzanine",
        url: TRACK.url,
        image: "https://lastfm.freetls.fastly.net/i/u/300x300/a.jpg",
        nowPlaying: false,
        loved: false,
        scrobbledAt: new Date(1764000000 * 1000).toISOString(),
      },
    ]);
  });

  it("flags the track that is playing right now, which has no timestamp", () => {
    const { tracks } = parseRecentTracks(recent([NOW_PLAYING, TRACK]));

    expect(tracks[0]).toMatchObject({ title: "Angel", nowPlaying: true, scrobbledAt: null });
    expect(tracks[1].nowPlaying).toBe(false);
  });

  it("accepts a single scrobble sent as an object instead of an array", () => {
    expect(parseRecentTracks(recent(TRACK)).tracks).toHaveLength(1);
  });

  it("reads the artist from #text when the request was not extended", () => {
    const plain = { ...TRACK, artist: { "#text": "Portishead" } };

    expect(parseRecentTracks(recent([plain])).tracks[0].artist).toBe("Portishead");
  });

  it("marks loved tracks", () => {
    expect(parseRecentTracks(recent([{ ...TRACK, loved: "1" }])).tracks[0].loved).toBe(true);
  });

  it("drops the grey-star placeholder Last.fm sends for missing artwork", () => {
    const placeholder = {
      ...TRACK,
      image: [
        {
          size: "extralarge",
          "#text":
            "https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png",
        },
      ],
    };

    expect(parseRecentTracks(recent([placeholder])).tracks[0].image).toBeNull();
  });

  it("falls back to a smaller image and to null for an empty album", () => {
    const small = {
      ...TRACK,
      album: { "#text": "" },
      image: [
        { size: "small", "#text": "https://example.com/s.jpg" },
        { size: "extralarge", "#text": "" },
      ],
    };
    const [track] = parseRecentTracks(recent([small])).tracks;

    expect(track.image).toBe("https://example.com/s.jpg");
    expect(track.album).toBeNull();
  });

  it("skips entries without a title or an artist", () => {
    const { tracks } = parseRecentTracks(recent([{ ...TRACK, name: "" }, { url: "x" }, TRACK]));

    expect(tracks.map((track) => track.title)).toEqual(["Teardrop"]);
  });

  it("respects the limit and a missing total", () => {
    const { tracks, total } = parseRecentTracks(
      { recenttracks: { track: [TRACK, TRACK, TRACK] } },
      2,
    );

    expect(tracks).toHaveLength(2);
    expect(total).toBeNull();
  });

  it("returns nothing for an empty body or a non-positive limit", () => {
    expect(parseRecentTracks({})).toEqual({ tracks: [], total: null });
    expect(parseRecentTracks(recent([TRACK]), 0).tracks).toEqual([]);
  });
});

describe("fetchLastfmScrobbles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("asks for the user's extended recent tracks", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(recent([TRACK])));

    await fetchLastfmScrobbles("dom", "key", 1);

    const url = new URL(mockFetch.mock.calls[0][0] as string);
    expect(url.origin + url.pathname).toBe("https://ws.audioscrobbler.com/2.0/");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      method: "user.getrecenttracks",
      user: "dom",
      api_key: "key",
      format: "json",
      extended: "1",
      limit: "1",
    });
  });

  it("returns the parsed scrobbles on success", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(recent([NOW_PLAYING])));

    const result = await fetchLastfmScrobbles("dom", "key");

    expect(result).toMatchObject({ ok: true, total: 48213 });
    expect(result.ok && result.tracks[0].nowPlaying).toBe(true);
  });

  it("pixelates the covers to the footer's 12px grid", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(recent([TRACK])));

    await fetchLastfmScrobbles("dom", "key");

    expect(pixelateEach).toHaveBeenCalledWith(expect.any(Array), "image", {
      width: 12,
      height: 12,
    });
  });

  it("surfaces an error code sent with a 200 as a failure", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 6, message: "User not found" }));

    const result = await fetchLastfmScrobbles("ghost", "key");

    expect(result).toEqual({
      ok: false,
      status: 502,
      message: "Last.fm error 6: User not found.",
    });
  });

  it("surfaces a non-200 response as a failure", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, false, 403));

    const result = await fetchLastfmScrobbles("dom", "bad");

    expect(result).toMatchObject({ ok: false, status: 403 });
  });

  it("reports a body that is not JSON", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    } as unknown as Response);

    const result = await fetchLastfmScrobbles("dom", "key");

    expect(result).toMatchObject({ ok: false, status: 502 });
  });
});

describe("isLastfmUsername", () => {
  it("accepts the characters Last.fm allows", () => {
    expect(isLastfmUsername("dmnktoe")).toBe(true);
    expect(isLastfmUsername("dj_shadow-99")).toBe(true);
  });

  it("rejects values that break the sign-up rules or reshape the query", () => {
    expect(isLastfmUsername("9lives")).toBe(false);
    expect(isLastfmUsername("a")).toBe(false);
    expect(isLastfmUsername("waytoolongusername")).toBe(false);
    expect(isLastfmUsername("dom&method=x")).toBe(false);
    expect(isLastfmUsername("dom user")).toBe(false);
    expect(isLastfmUsername(undefined)).toBe(false);
  });
});
