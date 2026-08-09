import { getFaviconUrl } from "./favicon-url";

describe("getFaviconUrl", () => {
  it("returns a proxy URL for an https href", () => {
    expect(getFaviconUrl("https://github.com/dmnktoe")).toBe(
      "/api/favicon?url=https%3A%2F%2Fgithub.com%2Fdmnktoe&sz=16",
    );
  });

  it("returns a proxy URL for an http href", () => {
    expect(getFaviconUrl("http://example.com/foo")).toBe(
      "/api/favicon?url=http%3A%2F%2Fexample.com%2Ffoo&sz=16",
    );
  });

  it("keeps the path so project pages resolve their own icon", () => {
    expect(getFaviconUrl("https://dmnktoe.github.io/buli-tabelle/")).toBe(
      "/api/favicon?url=https%3A%2F%2Fdmnktoe.github.io%2Fbuli-tabelle%2F&sz=16",
    );
  });

  it("accepts a custom size", () => {
    expect(getFaviconUrl("https://example.com", 64)).toBe(
      "/api/favicon?url=https%3A%2F%2Fexample.com%2F&sz=64",
    );
  });

  it("returns null for non-http protocols", () => {
    expect(getFaviconUrl("mailto:foo@example.com")).toBeNull();
    expect(getFaviconUrl("tel:+123456789")).toBeNull();
  });

  it("returns null for invalid URLs", () => {
    expect(getFaviconUrl("not a url")).toBeNull();
    expect(getFaviconUrl("/relative/path")).toBeNull();
  });
});
