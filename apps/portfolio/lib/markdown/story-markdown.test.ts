import { storyContentToMarkdown } from "./story-markdown";

function page(...body: unknown[]) {
  return { component: "page", body };
}

describe("storyContentToMarkdown", () => {
  it("returns an empty string for a missing or non-object story", () => {
    expect(storyContentToMarkdown(undefined)).toBe("");
    expect(storyContentToMarkdown("nope")).toBe("");
  });

  it("renders a headline at its level", () => {
    const markdown = storyContentToMarkdown(
      page({ component: "headline", text: "Studio", level: "1" }),
    );

    expect(markdown).toBe("# Studio");
  });

  it("defaults a headline with no level to h2", () => {
    expect(storyContentToMarkdown(page({ component: "headline", text: "Studio" }))).toBe(
      "## Studio",
    );
  });

  it("separates blocks with a blank line", () => {
    const markdown = storyContentToMarkdown(
      page(
        { component: "headline", text: "Studio", level: "2" },
        { component: "paragraph", text: "We make things." },
      ),
    );

    expect(markdown).toBe("## Studio\n\nWe make things.");
  });

  it("renders rich text with its structure intact", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "richtext",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Bold", marks: [{ type: "bold" }] }],
            },
          ],
        },
      }),
    );

    expect(markdown).toBe("**Bold**");
  });

  it("renders a list, ordered or not", () => {
    const items = [
      { component: "list_item", text: "One" },
      { component: "list_item", text: "Two" },
    ];

    expect(storyContentToMarkdown(page({ component: "list", items }))).toBe("- One\n- Two");
    expect(storyContentToMarkdown(page({ component: "list", items, ordered: true }))).toBe(
      "1. One\n2. Two",
    );
  });

  it("renders an accordion as headed sections", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "accordion",
        items: [{ component: "accordion_item", title: "Why?", content: "Because." }],
      }),
    );

    expect(markdown).toBe("### Why?\n\nBecause.");
  });

  it("renders a callout as a blockquote", () => {
    const markdown = storyContentToMarkdown(
      page({ component: "callout", title: "Heads up", body: "It ships Friday." }),
    );

    expect(markdown).toBe("> **Heads up**\n>\n> It ships Friday.");
  });

  it("fences a code block with its language and filename", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "code_block",
        code: "const x = 1;\n",
        language: "ts",
        filename: "demo.ts",
      }),
    );

    expect(markdown).toBe("**demo.ts**\n\n```ts\nconst x = 1;\n```");
  });

  it("renders an image with its alt text and caption", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "image",
        image: { filename: "https://a.storyblok.com/f/1/poster.jpg", alt: "Fallback" },
        alt: "A poster",
        caption: {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: "Riso, 2024" }] }],
        },
      }),
    );

    expect(markdown).toBe("![A poster](https://a.storyblok.com/f/1/poster.jpg)\n\n*Riso, 2024*");
  });

  it("falls back to the asset's own alt text", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "image",
        image: { filename: "https://a.storyblok.com/f/1/poster.jpg", alt: "Asset alt" },
      }),
    );

    expect(markdown).toBe("![Asset alt](https://a.storyblok.com/f/1/poster.jpg)");
  });

  it("lists every slide of a slideshow", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "slideshow",
        images: [
          { filename: "https://a.storyblok.com/one.jpg", alt: "One" },
          { filename: "https://a.storyblok.com/two.jpg", alt: "Two" },
        ],
      }),
    );

    expect(markdown).toBe(
      "![One](https://a.storyblok.com/one.jpg)\n![Two](https://a.storyblok.com/two.jpg)",
    );
  });

  it("links a video by its URL", () => {
    const markdown = storyContentToMarkdown(
      page({ component: "video", videoUrl: "https://youtu.be/abc" }),
    );

    expect(markdown).toBe("[Video](https://youtu.be/abc)");
  });

  it("renders a work card as a linked list item", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "work_card",
        title: "Poster Series",
        slug: "posters",
        description: "Riso",
      }),
    );

    expect(markdown).toBe("- [Poster Series](/work/posters) — Riso");
  });

  it("renders a music player entry", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "music_player",
        title: "Mega Mashup",
        artist: "te3shay",
        src: "https://cdn.example/track.mp3",
      }),
    );

    expect(markdown).toBe("- [Mega Mashup — te3shay](https://cdn.example/track.mp3)");
  });

  it("descends through layout bloks without emitting anything for them", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "section",
        content: [
          {
            component: "container",
            body: [{ component: "paragraph", text: "Deep inside." }],
          },
        ],
      }),
    );

    expect(markdown).toBe("Deep inside.");
  });

  it("falls back to the children of an unknown blok", () => {
    const markdown = storyContentToMarkdown(
      page({ component: "brand_new_thing", content: [{ component: "paragraph", text: "Kept." }] }),
    );

    expect(markdown).toBe("Kept.");
  });

  it("emits nothing for bloks with no textual content", () => {
    expect(
      storyContentToMarkdown(page({ component: "icon", name: "play" }, { component: "work_list" })),
    ).toBe("");
  });

  it("stops descending before a cyclic payload can hang the walk", () => {
    const loop: Record<string, unknown> = { component: "container" };
    loop.body = [loop];

    expect(() => storyContentToMarkdown(page(loop))).not.toThrow();
  });
});
