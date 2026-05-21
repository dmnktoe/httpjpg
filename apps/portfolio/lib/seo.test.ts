import { extractStoryMetadata, toNextMetadata } from "./seo";

describe("extractStoryMetadata", () => {
  it("prefers content.title over the story name", () => {
    const meta = extractStoryMetadata({
      name: "fallback-name",
      content: { title: "Pretty Title" },
    });
    expect(meta.title).toBe("Pretty Title");
  });

  it("falls back to the story name when content.title is missing", () => {
    const meta = extractStoryMetadata({ name: "fallback-name" });
    expect(meta.title).toBe("fallback-name");
  });

  it("uses a string description verbatim", () => {
    const meta = extractStoryMetadata({
      name: "n",
      content: { description: "Hello world" },
    });
    expect(meta.description).toBe("Hello world");
  });

  it("extracts plain text from a richtext description", () => {
    const meta = extractStoryMetadata({
      name: "n",
      content: {
        description: {
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Rich" },
                { type: "text", text: "text" },
              ],
            },
          ],
        },
      },
    });
    expect(meta.description).toBe("Rich text");
  });

  it("truncates richtext descriptions to 160 characters", () => {
    const long = "a".repeat(500);
    const meta = extractStoryMetadata({
      name: "n",
      content: {
        description: { content: [{ type: "text", text: long }] },
      },
    });
    expect(meta.description).toHaveLength(160);
  });

  it("returns an empty description when none is provided", () => {
    const meta = extractStoryMetadata({ name: "n" });
    expect(meta.description).toBe("");
  });

  it("builds an Open Graph image from the first content image", () => {
    const meta = extractStoryMetadata({
      name: "n",
      content: {
        title: "Title",
        images: [
          { filename: "https://a.storyblok.com/f/1/cover.jpg", alt: "Cover", focus: "10x20:11x21" },
        ],
      },
    });
    expect(meta.ogImage?.url).toContain("/m/1200x630/smart");
    expect(meta.ogImage?.alt).toBe("Cover");
  });

  it("uses the resolved title as og image alt when the image alt is missing", () => {
    const meta = extractStoryMetadata({
      name: "Story",
      content: {
        images: [{ filename: "https://a.storyblok.com/f/1/cover.jpg" }],
      },
    });
    expect(meta.ogImage?.alt).toBe("Story");
  });

  it("omits the og image when no image filename exists", () => {
    const meta = extractStoryMetadata({
      name: "n",
      content: { images: [{ alt: "no filename" }] },
    });
    expect(meta.ogImage).toBeUndefined();
  });

  it("omits the og image when content has no images at all", () => {
    const meta = extractStoryMetadata({ name: "n", content: {} });
    expect(meta.ogImage).toBeUndefined();
  });
});

describe("toNextMetadata", () => {
  it("returns the raw title for the page and a suffixed title in OG/Twitter", () => {
    const md = toNextMetadata({ title: "About", description: "All about me" }, "/about");
    expect(md.title).toBe("About");
    expect(md.openGraph?.title).toBe("About | httpjpg");
    expect(md.twitter?.title).toBe("About | httpjpg");
  });

  it("populates the OG url from the passed path", () => {
    const md = toNextMetadata({ title: "T", description: "D" }, "/some/path");
    expect(md.openGraph?.url).toBe("/some/path");
  });

  it("emits a 1200x630 OG image entry when an og image is provided", () => {
    const md = toNextMetadata(
      {
        title: "T",
        description: "D",
        ogImage: { url: "https://cdn/og.jpg", alt: "OG alt" },
      },
      "/",
    );
    const images = md.openGraph?.images as Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    expect(images).toEqual([
      { url: "https://cdn/og.jpg", width: 1200, height: 630, alt: "OG alt" },
    ]);
    expect(md.twitter?.images).toEqual(["https://cdn/og.jpg"]);
  });

  it("leaves images undefined when no og image is provided", () => {
    const md = toNextMetadata({ title: "T", description: "D" }, "/");
    expect(md.openGraph?.images).toBeUndefined();
    expect(md.twitter?.images).toBeUndefined();
  });

  it("uses summary_large_image as the twitter card type", () => {
    const md = toNextMetadata({ title: "T", description: "D" }, "/");
    const twitter = md.twitter as { card?: string } | undefined;
    expect(twitter?.card).toBe("summary_large_image");
  });

  it("declares the open graph type as website", () => {
    const md = toNextMetadata({ title: "T", description: "D" }, "/");
    const openGraph = md.openGraph as { type?: string } | undefined;
    expect(openGraph?.type).toBe("website");
  });
});
