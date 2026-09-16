import { EXTERNAL_LINK_CURSOR, resolveExternalHref } from "./external-link";

describe("resolveExternalHref", () => {
  it("treats site-relative paths as internal", () => {
    expect(resolveExternalHref("/about")).toEqual({ external: false, showIcon: false });
  });

  it("opens http(s) URLs in a new tab with an icon", () => {
    expect(resolveExternalHref("https://example.com")).toEqual({
      external: true,
      showIcon: true,
      rel: "noopener noreferrer",
      target: "_blank",
    });
  });

  it("honours an explicit isExternal override", () => {
    expect(resolveExternalHref("/local", true)).toMatchObject({
      external: true,
      target: "_blank",
    });
    expect(resolveExternalHref("https://example.com", false)).toEqual({
      external: false,
      showIcon: false,
    });
  });

  it("can hide the icon on an otherwise external URL", () => {
    expect(resolveExternalHref("https://example.com", undefined, false)).toMatchObject({
      external: true,
      showIcon: false,
    });
  });

  it("can show the icon on an otherwise internal URL", () => {
    expect(resolveExternalHref("/about", undefined, true)).toEqual({
      external: false,
      showIcon: true,
    });
  });
});

describe("EXTERNAL_LINK_CURSOR", () => {
  it("is a CSS cursor that paints the ↗ glyph", () => {
    expect(EXTERNAL_LINK_CURSOR).toContain("↗");
    expect(EXTERNAL_LINK_CURSOR).toMatch(/^url\(/);
  });
});
