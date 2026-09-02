import { isExternalLink, isSafeHref } from "./is-external-link";

describe("isExternalLink", () => {
  it("treats web, mail, and tel URLs as external", () => {
    expect(isExternalLink("https://example.com")).toBe(true);
    expect(isExternalLink("http://example.com")).toBe(true);
    expect(isExternalLink("mailto:hi@example.com")).toBe(true);
    expect(isExternalLink("tel:+15551212")).toBe(true);
  });

  it("treats site-relative paths as internal", () => {
    expect(isExternalLink("/about")).toBe(false);
    expect(isExternalLink("#top")).toBe(false);
    expect(isExternalLink("work/outlet")).toBe(false);
  });
});

describe("isSafeHref", () => {
  it("allows relative paths and the web schemes", () => {
    expect(isSafeHref("/about")).toBe(true);
    expect(isSafeHref("https://example.com")).toBe(true);
    expect(isSafeHref("mailto:hi@example.com")).toBe(true);
    expect(isSafeHref("tel:+15551212")).toBe(true);
  });

  it("rejects javascript and other non-web schemes", () => {
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("data:text/html,hi")).toBe(false);
    expect(isSafeHref("vbscript:msgbox(1)")).toBe(false);
  });

  it("strips ASCII control characters before reading the scheme", () => {
    expect(isSafeHref("java\nscript:alert(1)")).toBe(false);
    expect(isSafeHref(" java\tscript:alert(1)")).toBe(false);
  });
});
