import { collectStoryText } from "./story-text";

function richText(text: string) {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

describe("collectStoryText", () => {
  it("returns an empty string for empty content", () => {
    expect(collectStoryText(undefined)).toBe("");
    expect(collectStoryText({})).toBe("");
  });

  it("collects allowlisted text fields", () => {
    const content = { title: "Poster Series", headline: "Risograph", caption: "2024" };

    expect(collectStoryText(content)).toBe("Poster Series Risograph 2024");
  });

  it("indexes download labels via name", () => {
    const content = {
      title: "Outlet",
      downloads: [{ name: "Press kit.pdf", url: "https://cdn.example/press.pdf" }],
    };

    expect(collectStoryText(content)).toBe("Outlet Press kit.pdf");
  });

  it("ignores plumbing fields like uuids and colors", () => {
    const content = { title: "Kept", _uid: "abc-123", component: "work", color: "#ff0000" };

    expect(collectStoryText(content)).toBe("Kept");
  });

  it("flattens rich-text documents", () => {
    const content = { description: richText("A stark brutalist site") };

    expect(collectStoryText(content)).toBe("A stark brutalist site");
  });

  it("walks nested bloks in arrays", () => {
    const content = {
      title: "Page",
      body: [{ headline: "Section one" }, { body: [{ text: "Deep text" }] }],
    };

    expect(collectStoryText(content)).toBe("Page Section one Deep text");
  });

  it("collapses whitespace", () => {
    expect(collectStoryText({ text: "  spaced   out  " })).toBe("spaced out");
  });

  it("skips blank strings", () => {
    expect(collectStoryText({ title: "   ", text: "kept" })).toBe("kept");
  });

  it("truncates past the maximum length with an ellipsis", () => {
    const result = collectStoryText({ text: "abcdefghij" }, 5);

    expect(result).toBe("abcde…");
  });

  it("stops descending past the depth limit instead of hanging", () => {
    const deep: Record<string, unknown> = { text: "level-0" };
    let node = deep;
    for (let index = 1; index <= 12; index += 1) {
      const child: Record<string, unknown> = { text: `level-${index}` };
      node.child = child;
      node = child;
    }

    const result = collectStoryText(deep);

    expect(result).toContain("level-0");
    expect(result).not.toContain("level-12");
  });
});
