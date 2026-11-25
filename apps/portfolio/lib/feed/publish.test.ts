// @vitest-environment node
import {
  buildPostContent,
  MAX_CAPTION_LENGTH,
  MAX_IMAGES,
  parseAssetRequest,
  parsePublishRequest,
  postName,
  postSlug,
  publishAssetIds,
  type PublishRequest,
} from "./publish";

const DATE = new Date("2026-11-25T15:30:12.345Z");

function publish(body: unknown): PublishRequest {
  const parsed = parsePublishRequest(body);
  if (!parsed.ok) {
    throw new Error(parsed.message);
  }
  return parsed.value;
}

function rejection(body: unknown): string {
  const parsed = parsePublishRequest(body);
  return parsed.ok ? "" : parsed.message;
}

describe("parseAssetRequest", () => {
  it("accepts an image with its dimensions", () => {
    expect(parseAssetRequest({ filename: "DSC0001.JPG", width: 2592, height: 1944 })).toEqual({
      ok: true,
      value: { filename: "DSC0001.JPG", size: "2592x1944" },
    });
  });

  it("accepts audio without dimensions", () => {
    expect(parseAssetRequest({ filename: "mega mashup.mp3" })).toEqual({
      ok: true,
      value: { filename: "mega-mashup.mp3" },
    });
  });

  it("keeps the base name only and strips unsafe characters", () => {
    const parsed = parseAssetRequest({ filename: "../../etc/..hafen & fähre.png" });

    expect(parsed).toEqual({ ok: true, value: { filename: "hafen-fa-hre.png" } });
  });

  it.each([
    ["a non-object", "photo.jpg"],
    ["an array", ["photo.jpg"]],
    ["a missing filename", {}],
    ["an unsupported type", { filename: "notes.pdf" }],
    ["half a size", { filename: "a.jpg", width: 100 }],
    ["a fractional size", { filename: "a.jpg", width: 10.5, height: 10 }],
    ["an oversized image", { filename: "a.jpg", width: 20_001, height: 10 }],
  ])("rejects %s", (_label, body) => {
    expect(parseAssetRequest(body).ok).toBe(false);
  });
});

describe("parsePublishRequest", () => {
  it("fills the defaults of a one-image post", () => {
    expect(publish({ images: [{ assetId: 7 }] })).toEqual({
      caption: "",
      format: "1/1",
      images: [{ assetId: 7, fit: "cover" }],
      date: undefined,
    });
  });

  it("reads a carousel with caption, format, fit, alt and date", () => {
    expect(
      publish({
        caption: "  harbour, last night  ",
        format: "4/5",
        images: [
          { assetId: 7, fit: "contain", alt: " Harbour " },
          { assetId: 8, alt: null },
        ],
        date: "2025-03-01T12:00:00Z",
      }),
    ).toEqual({
      caption: "harbour, last night",
      format: "4/5",
      images: [
        { assetId: 7, fit: "contain", alt: "Harbour" },
        { assetId: 8, fit: "cover" },
      ],
      date: new Date("2025-03-01T12:00:00Z"),
    });
  });

  it("reads a music post from a share link", () => {
    expect(
      publish({
        music: {
          source: "soundcloud",
          src: "https://soundcloud.com/te3shay/sets/star-heart-edits-pt1",
          title: "star heart edits",
          artist: "te3shay",
        },
      }).music,
    ).toEqual({
      source: "soundcloud",
      src: "https://soundcloud.com/te3shay/sets/star-heart-edits-pt1",
      title: "star heart edits",
      artist: "te3shay",
    });
  });

  it("reads an uploaded mp3 with artwork", () => {
    expect(
      publish({ music: { source: "mp3", assetId: 11, artworkAssetId: 12, title: " " } }).music,
    ).toEqual({ source: "mp3", assetId: 11, artworkAssetId: 12 });
  });

  it("treats a null music entry as none", () => {
    expect(publish({ images: [{ assetId: 7 }], music: null }).music).toBeUndefined();
  });

  it.each([
    ["a non-object", null, "Expected a JSON object"],
    ["an empty post", {}, "at least one image"],
    ["a non-string caption", { caption: 3, images: [{ assetId: 1 }] }, "caption"],
    [
      "a caption past the limit",
      { caption: "x".repeat(MAX_CAPTION_LENGTH + 1), images: [{ assetId: 1 }] },
      "caption",
    ],
    ["an unknown format", { format: "16/9", images: [{ assetId: 1 }] }, "format"],
    ["images that are not a list", { images: "7" }, "images"],
    [
      "too many images",
      { images: Array.from({ length: MAX_IMAGES + 1 }, (_, i) => ({ assetId: i + 1 })) },
      "images",
    ],
    ["an image without an asset", { images: [{ fit: "cover" }] }, "assetId"],
    ["a fractional asset id", { images: [{ assetId: 1.5 }] }, "assetId"],
    ["an unknown fit", { images: [{ assetId: 1, fit: "stretch" }] }, "fit"],
    ["an over-long alt", { images: [{ assetId: 1, alt: "x".repeat(201) }] }, "alt"],
    ["an unknown music source", { music: { source: "tidal", src: "https://t.test" } }, "source"],
    ["music without a source URL", { music: { source: "spotify" } }, "https"],
    ["a non-https music URL", { music: { source: "mp3", src: "http://x.test/a.mp3" } }, "https"],
    ["a malformed music URL", { music: { source: "mp3", src: "not a url" } }, "https"],
    ["an upload on a streaming source", { music: { source: "spotify", assetId: 3 } }, "mp3"],
    [
      "a bad artwork asset",
      { music: { source: "mp3", assetId: 3, artworkAssetId: "x" } },
      "artworkAssetId",
    ],
    ["a non-string title", { music: { source: "mp3", assetId: 3, title: 4 } }, "title"],
    ["a client id that is too short", { images: [{ assetId: 1 }], clientId: "abc" }, "clientId"],
    [
      "a client id with odd characters",
      { images: [{ assetId: 1 }], clientId: "../../etc/x" },
      "clientId",
    ],
    ["a non-string date", { images: [{ assetId: 1 }], date: 20260101 }, "date"],
    ["an unreadable date", { images: [{ assetId: 1 }], date: "yesterday" }, "date"],
  ])("rejects %s", (_label, body, reason) => {
    expect(rejection(body)).toContain(reason);
  });
});

describe("publishAssetIds", () => {
  it("lists every upload once", () => {
    const request = publish({
      images: [{ assetId: 7 }, { assetId: 8 }, { assetId: 7 }],
      music: { source: "mp3", assetId: 9, artworkAssetId: 8 },
    });

    expect(publishAssetIds(request)).toEqual([7, 8, 9]);
  });

  it("has nothing to finish for a link post", () => {
    expect(
      publishAssetIds(publish({ music: { source: "spotify", src: "https://s.test" } })),
    ).toEqual([]);
  });
});

describe("buildPostContent", () => {
  const assets = new Map([
    [7, "https://a.storyblok.com/f/1/2592x1944/abc/dsc0001.jpg"],
    [9, "https://a.storyblok.com/f/1/def/mix.mp3"],
    [10, "https://a.storyblok.com/f/1/600x600/ghi/cover.jpg"],
  ]);

  it("builds the post blok with its image bloks", () => {
    const content = buildPostContent(
      publish({
        caption: "harbour",
        format: "original",
        images: [{ assetId: 7, fit: "contain", alt: "Harbour" }],
      }),
      assets,
      DATE,
    );

    expect(content).toMatchObject({
      component: "post",
      caption: "harbour",
      date: "2026-11-25 15:30",
      format: "original",
      music: [],
      images: [
        {
          component: "post_image",
          fit: "contain",
          alt: "Harbour",
          image: {
            id: 7,
            filename: "https://a.storyblok.com/f/1/2592x1944/abc/dsc0001.jpg",
            fieldtype: "asset",
            alt: "Harbour",
          },
        },
      ],
    });
    expect((content.images as Array<{ _uid: string }>)[0]?._uid).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("points an uploaded track and its artwork at their assets", () => {
    const content = buildPostContent(
      publish({ music: { source: "mp3", assetId: 9, artworkAssetId: 10, title: "mega mashup" } }),
      assets,
      DATE,
    );

    expect(content.music).toEqual([
      expect.objectContaining({
        component: "music_player",
        source: "mp3",
        src: "https://a.storyblok.com/f/1/def/mix.mp3",
        title: "mega mashup",
        artist: "",
        artwork: "https://a.storyblok.com/f/1/600x600/ghi/cover.jpg",
      }),
    ]);
    expect(content.images).toEqual([]);
  });

  it("keeps a share link as the source", () => {
    const content = buildPostContent(
      publish({ music: { source: "spotify", src: "https://open.spotify.com/track/abc" } }),
      assets,
      DATE,
    );

    expect(content.music).toEqual([
      expect.objectContaining({
        source: "spotify",
        src: "https://open.spotify.com/track/abc",
        artwork: "",
      }),
    ]);
  });
});

describe("postSlug", () => {
  it("stamps the UTC second and adds a random suffix", () => {
    expect(postSlug(DATE)).toMatch(/^20261125-153012-[0-9a-f]{4}$/);
  });

  it("derives the suffix from the draft's client id", () => {
    expect(postSlug(DATE, "draft-0001")).toMatch(/^20261125-153012-[0-9a-f]{8}$/);
    expect(postSlug(DATE, "draft-0001")).toBe(postSlug(DATE, "draft-0001"));
    expect(postSlug(DATE, "draft-0002")).not.toBe(postSlug(DATE, "draft-0001"));
  });

  it("keeps the lower-cased client id of a draft", () => {
    expect(publish({ images: [{ assetId: 1 }], clientId: "ABCDEF-12" }).clientId).toBe("abcdef-12");
  });
});

describe("postName", () => {
  it("uses the caption's first line, shortened", () => {
    const request = publish({
      caption: `${"long ".repeat(20)}\nsecond line`,
      images: [{ assetId: 1 }],
    });

    expect(postName(request, DATE)).toBe("long ".repeat(20).trim().slice(0, 60));
  });

  it("falls back to the date", () => {
    expect(postName(publish({ images: [{ assetId: 1 }] }), DATE)).toBe("Post 2026-11-25 15:30");
  });
});
