// @vitest-environment node
vi.mock("@httpjpg/env", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://example.test/" },
}));

const { getStories, getFeatureFlags } = vi.hoisted(() => ({
  getStories: vi.fn(),
  getFeatureFlags: vi.fn(),
}));

vi.mock("@httpjpg/storyblok-api", () => ({
  getStoryblokApi: () => ({ getStories }),
}));

vi.mock("@/lib/queries/widgets", () => ({ getFeatureFlags }));

// unstable_cache wraps the fetcher — pass it through unchanged.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /work/feed.xml", () => {
  it("returns 404 when the RSS feed flag is disabled", async () => {
    getFeatureFlags.mockResolvedValueOnce({ rssFeedEnabled: false });

    const response = await GET();

    expect(response.status).toBe(404);
  });

  it("renders an RSS document for top-level work stories", async () => {
    getFeatureFlags.mockResolvedValueOnce({ rssFeedEnabled: true });
    getStories.mockResolvedValueOnce({
      stories: [
        {
          slug: "alpha",
          full_slug: "work/alpha",
          name: "Alpha & Co",
          content: {
            title: "Alpha <Project>",
            date: "2024-05-01",
            description: { content: [{ type: "text", text: "Body" }] },
            images: [{ filename: "https://a.storyblok.com/f/1/a.jpg" }],
          },
        },
        // Nested slug — filtered out of the feed.
        { slug: "beta", full_slug: "work/group/beta" },
      ],
    });

    const response = await GET();
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/rss+xml");
    expect(body).toContain('<rss version="2.0"');
    // XML special characters are escaped.
    expect(body).toContain("Alpha &lt;Project&gt;");
    // Enclosure built from the first image.
    expect(body).toContain("<enclosure");
    // Base URL trailing slash is trimmed.
    expect(body).toContain("https://example.test/work/alpha");
    // Nested story excluded.
    expect(body).not.toContain("group/beta");
  });

  it("omits the enclosure when a story has no image", async () => {
    getFeatureFlags.mockResolvedValueOnce({ rssFeedEnabled: true });
    getStories.mockResolvedValueOnce({
      stories: [{ slug: "gamma", full_slug: "work/gamma", name: "Gamma" }],
    });

    const body = await (await GET()).text();

    expect(body).toContain("https://example.test/work/gamma");
    expect(body).not.toContain("<enclosure");
  });
});
