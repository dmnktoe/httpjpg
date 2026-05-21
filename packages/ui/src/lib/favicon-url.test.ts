import { getFaviconUrl } from "./favicon-url";

describe("getFaviconUrl", () => {
  it("returns a Google s2 favicon URL for an https href", () => {
    expect(getFaviconUrl("https://github.com/dmnktoe")).toBe(
      "https://www.google.com/s2/favicons?domain=github.com&sz=16",
    );
  });

  it("returns a Google s2 favicon URL for an http href", () => {
    expect(getFaviconUrl("http://example.com/foo")).toBe(
      "https://www.google.com/s2/favicons?domain=example.com&sz=16",
    );
  });

  it("honours a custom size", () => {
    expect(getFaviconUrl("https://example.com", 64)).toBe(
      "https://www.google.com/s2/favicons?domain=example.com&sz=64",
    );
  });

  it("returns null for mailto and tel hrefs", () => {
    expect(getFaviconUrl("mailto:foo@example.com")).toBeNull();
    expect(getFaviconUrl("tel:+123456789")).toBeNull();
  });

  it("returns null for invalid urls", () => {
    expect(getFaviconUrl("not a url")).toBeNull();
    expect(getFaviconUrl("/relative/path")).toBeNull();
  });
});
