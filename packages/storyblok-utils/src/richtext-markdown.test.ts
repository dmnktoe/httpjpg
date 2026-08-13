import { richTextToMarkdown } from "./richtext-markdown";

function doc(...content: unknown[]) {
  return { type: "doc", content };
}

function text(value: string, marks?: Array<Record<string, unknown>>) {
  return marks ? { type: "text", text: value, marks } : { type: "text", text: value };
}

function paragraph(...content: unknown[]) {
  return { type: "paragraph", content };
}

describe("richTextToMarkdown", () => {
  it("returns an empty string for a missing or malformed document", () => {
    expect(richTextToMarkdown(undefined)).toBe("");
    expect(richTextToMarkdown(null)).toBe("");
    expect(richTextToMarkdown({ content: "nope" })).toBe("");
  });

  it("renders paragraphs separated by a blank line", () => {
    const markdown = richTextToMarkdown(doc(paragraph(text("One")), paragraph(text("Two"))));

    expect(markdown).toBe("One\n\nTwo");
  });

  it("renders headings at their level", () => {
    const markdown = richTextToMarkdown(
      doc({ type: "heading", attrs: { level: 3 }, content: [text("Deep")] }),
    );

    expect(markdown).toBe("### Deep");
  });

  it("clamps an out-of-range heading level", () => {
    const markdown = richTextToMarkdown(
      doc({ type: "heading", attrs: { level: 9 }, content: [text("Too deep")] }),
    );

    expect(markdown).toBe("###### Too deep");
  });

  it("applies inline marks", () => {
    const markdown = richTextToMarkdown(
      doc(
        paragraph(
          text("bold", [{ type: "bold" }]),
          text(" and "),
          text("italic", [{ type: "italic" }]),
          text(" and "),
          text("gone", [{ type: "strike" }]),
        ),
      ),
    );

    expect(markdown).toBe("**bold** and *italic* and ~~gone~~");
  });

  it("renders a link", () => {
    const markdown = richTextToMarkdown(
      doc(paragraph(text("here", [{ type: "link", attrs: { href: "https://example.com" } }]))),
    );

    expect(markdown).toBe("[here](https://example.com)");
  });

  it("roots a story link at the site root", () => {
    const markdown = richTextToMarkdown(
      doc(
        paragraph(
          text("work", [{ type: "link", attrs: { linktype: "story", href: "work/demo" } }]),
        ),
      ),
    );

    expect(markdown).toBe("[work](/work/demo)");
  });

  it("appends a link anchor", () => {
    const markdown = richTextToMarkdown(
      doc(paragraph(text("jump", [{ type: "link", attrs: { href: "/about", anchor: "team" } }]))),
    );

    expect(markdown).toBe("[jump](/about#team)");
  });

  it("keeps a code span literal, even when it is also a link", () => {
    const markdown = richTextToMarkdown(
      doc(
        paragraph(
          text("npm i", [{ type: "code" }, { type: "bold" }]),
          text(" "),
          text("pnpm", [{ type: "code" }, { type: "link", attrs: { href: "/tools" } }]),
        ),
      ),
    );

    expect(markdown).toBe("`npm i` [`pnpm`](/tools)");
  });

  it("escapes Markdown syntax that appears in the text itself", () => {
    const markdown = richTextToMarkdown(doc(paragraph(text("a * b _ c [d]"))));

    expect(markdown).toBe("a \\* b \\_ c \\[d\\]");
  });

  it("renders a bullet list", () => {
    const markdown = richTextToMarkdown(
      doc({
        type: "bullet_list",
        content: [
          { type: "list_item", content: [paragraph(text("One"))] },
          { type: "list_item", content: [paragraph(text("Two"))] },
        ],
      }),
    );

    expect(markdown).toBe("- One\n- Two");
  });

  it("numbers an ordered list", () => {
    const markdown = richTextToMarkdown(
      doc({
        type: "ordered_list",
        content: [
          { type: "list_item", content: [paragraph(text("First"))] },
          { type: "list_item", content: [paragraph(text("Second"))] },
        ],
      }),
    );

    expect(markdown).toBe("1. First\n2. Second");
  });

  it("indents a nested list under its parent item", () => {
    const markdown = richTextToMarkdown(
      doc({
        type: "bullet_list",
        content: [
          {
            type: "list_item",
            content: [
              paragraph(text("Parent")),
              {
                type: "bullet_list",
                content: [{ type: "list_item", content: [paragraph(text("Child"))] }],
              },
            ],
          },
        ],
      }),
    );

    expect(markdown).toBe("- Parent\n\n  - Child");
  });

  it("renders a blockquote", () => {
    const markdown = richTextToMarkdown(
      doc({ type: "blockquote", content: [paragraph(text("Quoted"))] }),
    );

    expect(markdown).toBe("> Quoted");
  });

  it("renders a fenced code block with its language", () => {
    const markdown = richTextToMarkdown(
      doc({
        type: "code_block",
        attrs: { class: "language-ts" },
        content: [{ type: "text", text: "const x = 1;" }],
      }),
    );

    expect(markdown).toBe("```ts\nconst x = 1;\n```");
  });

  it("renders a horizontal rule", () => {
    expect(richTextToMarkdown(doc({ type: "horizontal_rule" }))).toBe("---");
  });

  it("renders an image with its alt text", () => {
    const markdown = richTextToMarkdown(
      doc({ type: "image", attrs: { src: "https://a.storyblok.com/x.jpg", alt: "A poster" } }),
    );

    expect(markdown).toBe("![A poster](https://a.storyblok.com/x.jpg)");
  });

  it("skips an image with no source", () => {
    expect(richTextToMarkdown(doc({ type: "image", attrs: { alt: "orphan" } }))).toBe("");
  });

  it("turns a hard break into a Markdown line break", () => {
    const markdown = richTextToMarkdown(
      doc(paragraph(text("One"), { type: "hard_break" }, text("Two"))),
    );

    expect(markdown).toBe("One  \nTwo");
  });

  it("drops empty blocks rather than leaving blank runs", () => {
    const markdown = richTextToMarkdown(doc(paragraph(), paragraph(text("Kept")), paragraph()));

    expect(markdown).toBe("Kept");
  });
});

describe("richTextToMarkdown · links", () => {
  it("falls back to the url attribute when there is no href", () => {
    const markdown = richTextToMarkdown(
      doc(paragraph(text("Elsewhere", [{ type: "link", attrs: { url: "https://example.com" } }]))),
    );

    expect(markdown).toBe("[Elsewhere](https://example.com)");
  });

  it("appends an anchor to the destination", () => {
    const markdown = richTextToMarkdown(
      doc(
        paragraph(text("Section", [{ type: "link", attrs: { href: "/about", anchor: "team" } }])),
      ),
    );

    expect(markdown).toBe("[Section](/about#team)");
  });

  it("roots a story link that is missing its leading slash", () => {
    const markdown = richTextToMarkdown(
      doc(
        paragraph(text("Work", [{ type: "link", attrs: { href: "work/x", linktype: "story" } }])),
      ),
    );

    expect(markdown).toBe("[Work](/work/x)");
  });

  it("leaves a story link that already has one alone", () => {
    const markdown = richTextToMarkdown(
      doc(
        paragraph(text("Work", [{ type: "link", attrs: { href: "/work/x", linktype: "story" } }])),
      ),
    );

    expect(markdown).toBe("[Work](/work/x)");
  });

  it("drops a link mark with no destination, keeping the text", () => {
    const markdown = richTextToMarkdown(
      doc(paragraph(text("Bare", [{ type: "link", attrs: {} }]))),
    );

    expect(markdown).toBe("Bare");
  });

  it("links inline code when it carries both marks", () => {
    const markdown = richTextToMarkdown(
      doc(
        paragraph(
          text("npm i", [{ type: "code" }, { type: "link", attrs: { href: "https://npmjs.com" } }]),
        ),
      ),
    );

    expect(markdown).toBe("[`npm i`](https://npmjs.com)");
  });

  it("strips backticks out of inline code so the span cannot break", () => {
    const markdown = richTextToMarkdown(doc(paragraph(text("a`b", [{ type: "code" }]))));

    expect(markdown).toBe("`ab`");
  });

  // A code span is literal in Markdown, so an escape inside one renders as a
  // backslash rather than disappearing.
  it("leaves inline code unescaped", () => {
    const markdown = richTextToMarkdown(doc(paragraph(text("foo_bar[0]", [{ type: "code" }]))));

    expect(markdown).toBe("`foo_bar[0]`");
  });

  it("still escapes the same characters in prose", () => {
    expect(richTextToMarkdown(doc(paragraph(text("foo_bar"))))).toBe("foo\\_bar");
  });
});

describe("richTextToMarkdown · headings and nodes", () => {
  it("clamps a heading deeper than six", () => {
    const markdown = richTextToMarkdown(
      doc({ type: "heading", attrs: { level: 9 }, content: [text("Deep")] }),
    );

    expect(markdown).toBe("###### Deep");
  });

  it("falls back to h1 for a level that is not a number", () => {
    const markdown = richTextToMarkdown(
      doc({ type: "heading", attrs: { level: "nope" }, content: [text("Odd")] }),
    );

    expect(markdown).toBe("# Odd");
  });

  it("drops an empty heading", () => {
    expect(richTextToMarkdown(doc({ type: "heading", attrs: { level: 2 }, content: [] }))).toBe("");
  });

  it("renders an emoji by its shortcode", () => {
    const markdown = richTextToMarkdown(
      doc(paragraph(text("hi "), { type: "emoji", attrs: { name: "wave" } })),
    );

    expect(markdown).toBe("hi :wave:");
  });

  it("drops an emoji with no name", () => {
    const markdown = richTextToMarkdown(doc(paragraph(text("hi"), { type: "emoji", attrs: {} })));

    expect(markdown).toBe("hi");
  });

  it("descends into an unrecognised inline node instead of dropping its text", () => {
    const markdown = richTextToMarkdown(
      doc(paragraph({ type: "something_new", content: [text("Kept")] })),
    );

    expect(markdown).toBe("Kept");
  });

  it("gives an image its title when one is set", () => {
    const markdown = richTextToMarkdown(
      doc({ type: "image", attrs: { src: "https://img/a.jpg", alt: "Alt", title: "Titled" } }),
    );

    expect(markdown).toBe('![Alt](https://img/a.jpg "Titled")');
  });

  it("drops an image with no source", () => {
    expect(richTextToMarkdown(doc({ type: "image", attrs: { alt: "Alt" } }))).toBe("");
  });

  it("emits nothing for a stray hard break at block level", () => {
    expect(richTextToMarkdown(doc({ type: "hard_break" }))).toBe("");
  });
});

describe("richTextToMarkdown · lists", () => {
  it("indents the continuation lines of a multi-block list item", () => {
    const markdown = richTextToMarkdown(
      doc({
        type: "bullet_list",
        content: [
          {
            type: "list_item",
            content: [paragraph(text("First")), paragraph(text("Second"))],
          },
        ],
      }),
    );

    expect(markdown).toBe("- First\n\n  Second");
  });

  it("skips an empty list item rather than emitting a bare bullet", () => {
    const markdown = richTextToMarkdown(
      doc({
        type: "ordered_list",
        content: [
          { type: "list_item", content: [paragraph(text("Kept"))] },
          { type: "list_item", content: [] },
        ],
      }),
    );

    expect(markdown).toBe("1. Kept");
  });
});
