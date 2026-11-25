// @vitest-environment node
import type { FeedPostEntry } from "../queries/feed";
import { FEED_PANEL_SIZE, toFeedPanelItems } from "./panel";

const IMAGE = "https://a.storyblok.com/f/1/800x1000/abc/a.jpg";

function post(id: string, content: Record<string, unknown>): FeedPostEntry {
  return { id, href: `/feed/${id}`, content: { _uid: id, component: "post", ...content } } as never;
}

function image(overrides: Record<string, unknown> = {}) {
  return { _uid: "img", component: "post_image", image: { filename: IMAGE }, ...overrides };
}

describe("toFeedPanelItems", () => {
  it("shows a post by its first image with a file", () => {
    const [item] = toFeedPanelItems([
      post("a", {
        caption: " harbour ",
        images: [image({ image: { filename: "" } }), image({ fit: "contain" })],
      }),
    ]);

    expect(item).toMatchObject({ id: "a", alt: "harbour", fit: "contain" });
    expect(item?.src).toContain(`${IMAGE}/m/960x0`);
    expect(item?.srcSet).toContain("320w");
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

    expect(blokAlt?.alt).toBe("Blok alt");
    expect(assetAlt?.alt).toBe("Asset alt");
    expect(none).toMatchObject({ alt: "", fit: "cover" });
  });

  it("leaves an external image without a srcSet", () => {
    const [item] = toFeedPanelItems([
      post("a", { images: [image({ image: { filename: "https://x.test/a.jpg" } })] }),
    ]);

    expect(item).toEqual({ id: "a", src: "https://x.test/a.jpg", alt: "", fit: "cover" });
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
      post("bare", {
        music: [{ _uid: "m", component: "music_player", src: "x", title: "no cover" }],
      }),
      post("empty", {}),
    ]);

    expect(items).toEqual([
      { id: "mix", src: "https://x.test/cover.jpg", alt: "mega mashup — te3shay", fit: "cover" },
    ]);
  });

  it("stops at the panel's size", () => {
    const posts = Array.from({ length: FEED_PANEL_SIZE + 3 }, (_, i) =>
      post(`p${i}`, { images: [image()] }),
    );

    expect(toFeedPanelItems(posts)).toHaveLength(FEED_PANEL_SIZE);
  });
});
