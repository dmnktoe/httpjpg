// @vitest-environment node
import type { FeedPostEntry } from "../queries/feed";
import { FEED_PANEL_IMAGES, FEED_PANEL_SIZE, toFeedPanelItems } from "./panel";

const IMAGE = "https://a.storyblok.com/f/1/800x1000/abc/a.jpg";

function post(id: string, content: Record<string, unknown>): FeedPostEntry {
  return { id, href: `/feed/${id}`, content: { _uid: id, component: "post", ...content } } as never;
}

function image(overrides: Record<string, unknown> = {}) {
  return { _uid: "img", component: "post_image", image: { filename: IMAGE }, ...overrides };
}

describe("toFeedPanelItems", () => {
  it("shows a post by every image that has a file", () => {
    const [item] = toFeedPanelItems([
      post("a", {
        caption: " harbour \nsecond line",
        images: [
          image({ _uid: "empty", image: { filename: "" } }),
          image({ _uid: "one", fit: "contain" }),
          image({ _uid: "two" }),
        ],
      }),
    ]);

    expect(item).toMatchObject({ id: "a", caption: "harbour" });
    expect(item?.images.map((entry) => entry.id)).toEqual(["one", "two"]);
    expect(item?.images[0]).toMatchObject({ alt: "harbour", fit: "contain" });
    expect(item?.images[0]?.src).toContain(`${IMAGE}/m/960x0`);
    expect(item?.images[0]?.srcSet).toContain("320w");
  });

  it("keeps a long carousel short", () => {
    const [item] = toFeedPanelItems([
      post("a", {
        images: Array.from({ length: FEED_PANEL_IMAGES + 4 }, (_, i) => image({ _uid: `i${i}` })),
      }),
    ]);

    expect(item?.images).toHaveLength(FEED_PANEL_IMAGES);
  });

  it("prefers the image's own alt text", () => {
    const [blokAlt, assetAlt, none] = toFeedPanelItems([
      post("a", {
        caption: "c",
        images: [image({ alt: "Blok alt", image: { filename: IMAGE, alt: "x" } })],
      }),
      post("b", {
        caption: "c",
        images: [image({ image: { filename: IMAGE, alt: "Asset alt" } })],
      }),
      post("c", { images: [image()] }),
    ]);

    expect(blokAlt?.images[0]?.alt).toBe("Blok alt");
    expect(assetAlt?.images[0]?.alt).toBe("Asset alt");
    expect(none?.images[0]).toMatchObject({ alt: "", fit: "cover" });
    expect(none).not.toHaveProperty("caption");
  });

  it("leaves an external image without a srcSet", () => {
    const [item] = toFeedPanelItems([
      post("a", { images: [image({ image: { filename: "https://x.test/a.jpg" } })] }),
    ]);

    expect(item).toEqual({
      id: "a",
      images: [{ id: "img", src: "https://x.test/a.jpg", alt: "", fit: "cover" }],
    });
  });

  it("shows a music post by its artwork and skips one without", () => {
    const items = toFeedPanelItems([
      post("mix", {
        images: [],
        music: [
          {
            _uid: "m",
            component: "music_player",
            src: "x",
            title: "mega mashup",
            artist: "te3shay",
            artwork: "https://x.test/cover.jpg",
          },
        ],
      }),
      post("captioned", {
        caption: "new mix",
        music: [
          { _uid: "n", component: "music_player", src: "x", artwork: "https://x.test/n.jpg" },
        ],
      }),
      post("bare", {
        music: [{ _uid: "m", component: "music_player", src: "x", title: "no cover" }],
      }),
      post("empty", {}),
    ]);

    expect(items).toEqual([
      {
        id: "mix",
        caption: "mega mashup — te3shay",
        images: [
          { id: "m", src: "https://x.test/cover.jpg", alt: "mega mashup — te3shay", fit: "cover" },
        ],
      },
      {
        id: "captioned",
        caption: "new mix",
        images: [{ id: "n", src: "https://x.test/n.jpg", alt: "", fit: "cover" }],
      },
    ]);
  });

  it("stops at the panel's size", () => {
    const posts = Array.from({ length: FEED_PANEL_SIZE + 3 }, (_, i) =>
      post(`p${i}`, { images: [image()] }),
    );

    expect(toFeedPanelItems(posts)).toHaveLength(FEED_PANEL_SIZE);
  });
});
