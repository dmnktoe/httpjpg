// @vitest-environment node
import { beforeEach, type MockedFunction, vi } from "vitest";

import { fetchYoutubeStatus, isYoutubeChannelId, parseChannel, parseUploads } from "./youtube";

// Pixelation has its own tests; here it passes images through untouched.
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

const CHANNEL_ID = "UC_x5XG1OV2P6uZZ5FSM9Ttw";

const CHANNEL = {
  id: CHANNEL_ID,
  snippet: {
    title: "httpjpg",
    customUrl: "@httpjpg",
    thumbnails: {
      default: { url: "https://yt3.test/s88" },
      medium: { url: "https://yt3.test/s240" },
    },
  },
  statistics: { subscriberCount: "1230", hiddenSubscriberCount: false },
  contentDetails: { relatedPlaylists: { uploads: "UU_x5XG1OV2P6uZZ5FSM9Ttw" } },
};

const UPLOAD = {
  snippet: {
    title: "Studio tour",
    thumbnails: { medium: { url: "https://i.ytimg.test/mq.jpg" } },
    resourceId: { videoId: "dQw4w9WgXcQ" },
  },
  contentDetails: { videoId: "dQw4w9WgXcQ", videoPublishedAt: "2026-11-20T10:00:00Z" },
};

describe("parseChannel", () => {
  it("maps the channel with its handle url and subscriber count", () => {
    expect(parseChannel({ items: [CHANNEL] })).toEqual({
      id: CHANNEL_ID,
      title: "httpjpg",
      avatar: "https://yt3.test/s240",
      url: "https://www.youtube.com/@httpjpg",
      subscriberCount: 1230,
    });
  });

  it("hides the count when the channel does and links by id without a handle", () => {
    const hidden = {
      ...CHANNEL,
      snippet: { title: "httpjpg" },
      statistics: { hiddenSubscriberCount: true, subscriberCount: "0" },
    };

    expect(parseChannel({ items: [hidden] })).toMatchObject({
      url: `https://www.youtube.com/channel/${CHANNEL_ID}`,
      avatar: null,
      subscriberCount: null,
    });
  });

  it("returns null for an unknown channel", () => {
    expect(parseChannel({ items: [] })).toBeNull();
    expect(parseChannel({})).toBeNull();
  });
});

describe("parseUploads", () => {
  it("maps uploads to watch links", () => {
    expect(parseUploads({ items: [UPLOAD] })).toEqual([
      {
        id: "dQw4w9WgXcQ",
        title: "Studio tour",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "https://i.ytimg.test/mq.jpg",
        publishedAt: "2026-11-20T10:00:00Z",
      },
    ]);
  });

  it("skips private and deleted uploads", () => {
    const gone = (title: string) => ({ ...UPLOAD, snippet: { ...UPLOAD.snippet, title } });

    const videos = parseUploads({ items: [gone("Private video"), gone("Deleted video"), UPLOAD] });

    expect(videos.map((video) => video.title)).toEqual(["Studio tour"]);
  });

  it("falls back to the snippet's video id and respects the limit", () => {
    const noDetails = { snippet: UPLOAD.snippet };

    expect(parseUploads({ items: [noDetails] })[0]).toMatchObject({
      id: "dQw4w9WgXcQ",
      publishedAt: null,
    });
    expect(parseUploads({ items: [UPLOAD, UPLOAD, UPLOAD] }, 2)).toHaveLength(2);
    expect(parseUploads({ items: [UPLOAD] }, 0)).toEqual([]);
  });
});

describe("fetchYoutubeStatus", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("reads the channel, then its uploads playlist", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ items: [CHANNEL] }))
      .mockResolvedValueOnce(jsonResponse({ items: [UPLOAD] }));

    const result = await fetchYoutubeStatus(CHANNEL_ID, "key", 1);

    const channelUrl = new URL(String(mockFetch.mock.calls[0][0]));
    const uploadsUrl = new URL(String(mockFetch.mock.calls[1][0]));
    expect(channelUrl.pathname).toBe("/youtube/v3/channels");
    expect(channelUrl.searchParams.get("id")).toBe(CHANNEL_ID);
    expect(uploadsUrl.pathname).toBe("/youtube/v3/playlistItems");
    expect(uploadsUrl.searchParams.get("playlistId")).toBe("UU_x5XG1OV2P6uZZ5FSM9Ttw");
    expect(uploadsUrl.searchParams.get("maxResults")).toBe("2");
    expect(result).toMatchObject({ ok: true, status: { videos: [{ title: "Studio tour" }] } });
  });

  it("keeps the channel when it has no uploads playlist yet", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ items: [CHANNEL] }))
      .mockResolvedValueOnce(jsonResponse({}, false, 404));

    const result = await fetchYoutubeStatus(CHANNEL_ID, "key");

    expect(result).toMatchObject({ ok: true, status: { videos: [] } });
  });

  it("fails with 404 for an unknown channel without asking for uploads", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ items: [] }));

    expect(await fetchYoutubeStatus(CHANNEL_ID, "key")).toMatchObject({ ok: false, status: 404 });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("surfaces a rejected key and a failing uploads call", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, false, 403));
    expect(await fetchYoutubeStatus(CHANNEL_ID, "bad")).toMatchObject({ ok: false, status: 403 });

    mockFetch
      .mockResolvedValueOnce(jsonResponse({ items: [CHANNEL] }))
      .mockResolvedValueOnce(jsonResponse({}, false, 500));
    expect(await fetchYoutubeStatus(CHANNEL_ID, "key")).toMatchObject({ ok: false, status: 500 });
  });
});

describe("isYoutubeChannelId", () => {
  it("accepts UC channel ids only", () => {
    expect(isYoutubeChannelId(CHANNEL_ID)).toBe(true);
    expect(isYoutubeChannelId("@httpjpg")).toBe(false);
    expect(isYoutubeChannelId("UCshort")).toBe(false);
    expect(isYoutubeChannelId(`${CHANNEL_ID}&x`)).toBe(false);
    expect(isYoutubeChannelId(undefined)).toBe(false);
  });
});
