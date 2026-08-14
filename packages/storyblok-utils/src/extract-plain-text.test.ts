import { extractPlainText } from "./extract-plain-text";

const doc = {
  content: [
    { type: "paragraph", content: [{ type: "text", text: "Hello" }] },
    { type: "paragraph", content: [{ type: "text", text: "world" }] },
  ],
};

describe("extractPlainText", () => {
  it("returns an empty string for null or content-less input", () => {
    expect(extractPlainText(null)).toBe("");
    expect(extractPlainText(undefined)).toBe("");
    expect(extractPlainText({})).toBe("");
  });

  it("concatenates nested text nodes", () => {
    expect(extractPlainText(doc)).toBe("Hello world");
  });

  it("truncates to maxLength when provided", () => {
    expect(extractPlainText(doc, 5)).toBe("Hello");
  });

  it("ignores nodes without text", () => {
    expect(
      extractPlainText({ content: [{ type: "horizontal_rule" }, { type: "text", text: "x" }] }),
    ).toBe("x");
  });

  it("tolerates malformed content without throwing", () => {
    // A `type: "doc"` guard on the caller side does not prove `content` is a
    // well-formed node array; the extractor must not throw on the odd shapes.
    expect(extractPlainText({ content: "nope" } as never)).toBe("");
    expect(extractPlainText({ content: [null, { type: "text", text: "x" }] } as never)).toBe("x");
    expect(extractPlainText({ content: [{ type: "paragraph", content: "bad" }] } as never)).toBe(
      "",
    );
  });
});
