// @vitest-environment node
vi.mock("@httpjpg/env", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://example.test" },
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

const { getStories } = vi.hoisted(() => ({ getStories: vi.fn() }));

vi.mock("@httpjpg/storyblok-api", () => ({
  getStoryblokApi: () => ({ getStories }),
}));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";

import sitemap from "./sitemap";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sitemap", () => {
  it("maps published stories and prepends the home page", async () => {
    getStories.mockResolvedValueOnce({
      stories: [
        {
          slug: "about",
          full_slug: "about",
          first_published_at: "2024-01-01",
          published_at: "2024-02-01",
          is_startpage: false,
        },
        {
          slug: "project",
          full_slug: "work/project",
          first_published_at: "2024-01-01",
          published_at: null,
          is_startpage: false,
        },
      ],
    });

    const entries = await sitemap();

    // Home page is unshifted to the front.
    expect(entries[0].url).toBe("https://example.test");
    expect(entries.some((e) => e.url === "https://example.test/about")).toBe(true);
    const work = entries.find((e) => e.url === "https://example.test/work/project");
    expect(work?.changeFrequency).toBe("monthly");
  });

  it("filters out folders, excluded slugs, external-only and unpublished stories", async () => {
    getStories.mockResolvedValueOnce({
      stories: [
        {
          slug: "config",
          full_slug: "config",
          first_published_at: "2024-01-01",
          is_startpage: false,
        },
        {
          slug: "folder",
          full_slug: "folder",
          first_published_at: "2024-01-01",
          is_startpage: true,
        },
        { slug: "draft", full_slug: "draft", first_published_at: null, is_startpage: false },
        {
          slug: "ext",
          full_slug: "ext",
          first_published_at: "2024-01-01",
          is_startpage: false,
          content: { external_only: true },
        },
      ],
    });

    const entries = await sitemap();
    // Only the home entry survives the filters.
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe("https://example.test");
  });

  it("falls back to a minimal sitemap and reports on error", async () => {
    getStories.mockRejectedValueOnce(new Error("down"));

    const entries = await sitemap();

    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe("https://example.test");
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
