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
});
