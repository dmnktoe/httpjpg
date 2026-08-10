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

  // Storyblok stores an internal link as a bare slug.
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

  // Nothing inside a code span may be re-marked, or the backticks stop being literal.
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
