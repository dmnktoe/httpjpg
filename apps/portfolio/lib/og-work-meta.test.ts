import {
  formatYear,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  pickTitleSize,
  toAbsoluteStoryblokUrl,
  toOgAsciiSampleUrl,
  toOgImageUrl,
} from "./og-work-meta";

describe("toAbsoluteStoryblokUrl", () => {
  it("upgrades protocol-relative Storyblok URLs to https", () => {
    expect(toAbsoluteStoryblokUrl("//a.storyblok.com/f/1/cover.jpg")).toBe(
      "https://a.storyblok.com/f/1/cover.jpg",
    );
  });

  it("passes through full https Storyblok URLs unchanged", () => {
    expect(toAbsoluteStoryblokUrl("https://a.storyblok.com/f/1/cover.jpg")).toBe(
      "https://a.storyblok.com/f/1/cover.jpg",
    );
  });

  it("rejects URLs on other hosts", () => {
    expect(toAbsoluteStoryblokUrl("https://evil.example/cover.jpg")).toBeNull();
  });

  it("rejects http even on the Storyblok host", () => {
    expect(toAbsoluteStoryblokUrl("http://a.storyblok.com/f/1/cover.jpg")).toBeNull();
  });

  it("rejects subdomain spoofs", () => {
    expect(toAbsoluteStoryblokUrl("https://a.storyblok.com.evil.example/cover.jpg")).toBeNull();
  });

  it("rejects garbage / unparsable input", () => {
    expect(toAbsoluteStoryblokUrl("not a url")).toBeNull();
  });

  it("rejects empty input", () => {
    expect(toAbsoluteStoryblokUrl("")).toBeNull();
  });
});

describe("toOgImageUrl", () => {
  it("builds the canonical OG smart-crop URL on top of a Storyblok asset", () => {
    expect(toOgImageUrl("//a.storyblok.com/f/1/cover.jpg")).toBe(
      `https://a.storyblok.com/f/1/cover.jpg/m/${OG_IMAGE_WIDTH}x${OG_IMAGE_HEIGHT}/smart`,
    );
  });

  it("returns null when the source URL isn't a Storyblok asset", () => {
    expect(toOgImageUrl("https://evil.example/cover.jpg")).toBeNull();
  });

  it("returns null on empty input", () => {
    expect(toOgImageUrl("")).toBeNull();
  });
});

describe("toOgAsciiSampleUrl", () => {
  it("builds a tiny grayscale JPEG URL for the ASCII sampler", () => {
    expect(toOgAsciiSampleUrl("//a.storyblok.com/f/1/cover.png")).toBe(
      "https://a.storyblok.com/f/1/cover.png/m/400x150/filters:format(jpg):grayscale()",
    );
  });

  it("returns null when the source URL isn't a Storyblok asset", () => {
    expect(toOgAsciiSampleUrl("https://evil.example/cover.png")).toBeNull();
  });
});

describe("formatYear", () => {
  it("returns an empty string for undefined", () => {
    expect(formatYear(undefined)).toBe("");
  });

  it("returns an empty string for an empty string", () => {
    expect(formatYear("")).toBe("");
  });

  it("extracts the four-digit year from an ISO date", () => {
    expect(formatYear("2024-06-12")).toBe("2024");
  });

  it("returns an empty string when the input doesn't parse as a date", () => {
    expect(formatYear("not a date")).toBe("");
  });
});

describe("pickTitleSize", () => {
  it("scales to 144 for short titles", () => {
    expect(pickTitleSize("short")).toBe(144);
    expect(pickTitleSize("a".repeat(14))).toBe(144);
  });

  it("steps down to 120 for medium-length titles", () => {
    expect(pickTitleSize("a".repeat(15))).toBe(120);
    expect(pickTitleSize("a".repeat(22))).toBe(120);
  });

  it("steps down to 96 for longer titles", () => {
    expect(pickTitleSize("a".repeat(23))).toBe(96);
    expect(pickTitleSize("a".repeat(32))).toBe(96);
  });

  it("clamps to 72 for very long titles", () => {
    expect(pickTitleSize("a".repeat(33))).toBe(72);
    expect(pickTitleSize("a".repeat(120))).toBe(72);
  });
});
