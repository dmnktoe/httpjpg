import { storyblokHref } from "./href";

describe("storyblokHref", () => {
  it("returns an empty string when no link is given", () => {
    expect(storyblokHref(undefined)).toBe("");
  });

  it("builds a mailto: link for email link types", () => {
    expect(storyblokHref({ linktype: "email", email: "a@b.com" } as never)).toBe("mailto:a@b.com");
  });

  it("returns an empty string for an email link type without an address", () => {
    expect(storyblokHref({ linktype: "email" } as never)).toBe("");
  });

  it("returns the raw url for url and asset link types", () => {
    expect(storyblokHref({ linktype: "url", url: "https://x.dev" } as never)).toBe("https://x.dev");
    expect(storyblokHref({ linktype: "asset", url: "https://x.dev/a.pdf" } as never)).toBe(
      "https://x.dev/a.pdf",
    );
  });

  it("normalises a story path to a leading slash", () => {
    expect(storyblokHref({ linktype: "story", cached_url: "work/foo" } as never)).toBe("/work/foo");
  });

  it("keeps an existing leading slash and appends an anchor", () => {
    expect(
      storyblokHref({ linktype: "story", cached_url: "/about", anchor: "team" } as never),
    ).toBe("/about#team");
  });
});
