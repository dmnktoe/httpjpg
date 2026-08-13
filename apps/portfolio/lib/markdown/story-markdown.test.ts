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

describe("storyContentToMarkdown · structural bloks", () => {
  it("walks a work story's body the same way it walks a page", () => {
    const markdown = storyContentToMarkdown({
      component: "work",
      body: [{ component: "paragraph", text: "A project." }],
    });

    expect(markdown).toBe("A project.");
  });

  it("descends into a grid and its items", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "grid",
        items: [
          {
            component: "grid_item",
            content: [{ component: "paragraph", text: "Cell." }],
          },
        ],
      }),
    );

    expect(markdown).toBe("Cell.");
  });

  it("renders a marquee as its plain text", () => {
    expect(storyContentToMarkdown(page({ component: "marquee", text: "Rolling." }))).toBe(
      "Rolling.",
    );
  });

  it("clamps a heading deeper than h6", () => {
    expect(storyContentToMarkdown(page({ component: "headline", text: "Deep", level: "9" }))).toBe(
      "###### Deep",
    );
  });

  it("drops a headline with no text", () => {
    expect(storyContentToMarkdown(page({ component: "headline", level: "2" }))).toBe("");
  });
});

describe("storyContentToMarkdown · lists and stats", () => {
  it("numbers an ordered list", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "list",
        ordered: true,
        items: [
          { component: "list_item", text: "First" },
          { component: "list_item", text: "Second" },
        ],
      }),
    );

    expect(markdown).toBe("1. First\n2. Second");
  });

  it("skips a list item with no text rather than emitting a bare bullet", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "list",
        items: [{ component: "list_item", text: "Kept" }, { component: "list_item" }],
      }),
    );

    expect(markdown).toBe("- Kept");
  });

  it("renders stats as a list, with the caption in brackets", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "stats",
        items: [
          { component: "stat_item", value: "12", label: "Projects", caption: "since 2019" },
          { component: "stat_item", value: "3", label: "Awards" },
        ],
      }),
    );

    expect(markdown).toBe("- 12 — Projects (since 2019)\n- 3 — Awards");
  });

  it("drops a stat with neither value nor label", () => {
    expect(
      storyContentToMarkdown(page({ component: "stats", items: [{ component: "stat_item" }] })),
    ).toBe("");
  });

  it("renders badges as inline images and drops the ones with no source", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "badges",
        items: [
          { component: "badge_item", src: "https://img.example/a.svg", alt: "build" },
          { component: "badge_item", alt: "nothing" },
        ],
      }),
    );

    expect(markdown).toBe("![build](https://img.example/a.svg)");
  });
});

describe("storyContentToMarkdown · links and dividers", () => {
  it("renders a link with its URL", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "link",
        text: "Read more",
        link: { linktype: "url", url: "https://example.com" },
      }),
    );

    expect(markdown).toBe("[Read more](https://example.com)");
  });

  it("falls back to bare text when a button has no destination", () => {
    expect(storyContentToMarkdown(page({ component: "button", text: "Press" }))).toBe("Press");
  });

  it("drops a link with no text", () => {
    expect(
      storyContentToMarkdown(
        page({ component: "link", link: { linktype: "url", url: "https://example.com" } }),
      ),
    ).toBe("");
  });

  it("renders a divider as a rule, or as its label when it has one", () => {
    expect(storyContentToMarkdown(page({ component: "divider" }))).toBe("---");
    expect(storyContentToMarkdown(page({ component: "divider", label: "· · ·" }))).toBe("· · ·");
  });
});

describe("storyContentToMarkdown · media", () => {
  it("renders a scroll-clip image like an ordinary one", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "scroll_clip_image",
        image: { filename: "https://a.storyblok.com/f/1/x.jpg", alt: "Fallback" },
      }),
    );

    expect(markdown).toBe("![Fallback](https://a.storyblok.com/f/1/x.jpg)");
  });

  it("prefers the blok's own alt over the asset's", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "image",
        alt: "Chosen",
        image: { filename: "https://a.storyblok.com/f/1/x.jpg", alt: "Fallback" },
      }),
    );

    expect(markdown).toBe("![Chosen](https://a.storyblok.com/f/1/x.jpg)");
  });

  it("drops an image blok with no asset", () => {
    expect(storyContentToMarkdown(page({ component: "image" }))).toBe("");
  });

  it("links a video by its uploaded asset when no URL is set", () => {
    const markdown = storyContentToMarkdown(
      page({ component: "video", video: { filename: "https://a.storyblok.com/f/1/v.mp4" } }),
    );

    expect(markdown).toBe("[Video](https://a.storyblok.com/f/1/v.mp4)");
  });

  it("emits nothing for a video with neither a URL nor an asset", () => {
    expect(storyContentToMarkdown(page({ component: "video" }))).toBe("");
  });
});

describe("storyContentToMarkdown · code and music", () => {
  it("labels a fenced block with its filename", () => {
    const markdown = storyContentToMarkdown(
      page({
        component: "code_block",
        filename: "index.ts",
        language: "ts",
        code: "const a = 1;\n",
      }),
    );

    expect(markdown).toBe("**index.ts**\n\n```ts\nconst a = 1;\n```");
  });

  it("drops a code block with no code", () => {
    expect(storyContentToMarkdown(page({ component: "code_block", language: "ts" }))).toBe("");
  });

  it("links a track when it has a source, and names it plainly when it does not", () => {
    expect(
      storyContentToMarkdown(
        page({ component: "music_player", title: "Track", artist: "Someone", src: "/a.mp3" }),
      ),
    ).toBe("- [Track — Someone](/a.mp3)");

    expect(storyContentToMarkdown(page({ component: "music_player", title: "Track" }))).toBe(
      "- Track",
    );
  });

  it("drops a music player with neither title nor artist", () => {
    expect(storyContentToMarkdown(page({ component: "music_player", src: "/a.mp3" }))).toBe("");
  });
});
