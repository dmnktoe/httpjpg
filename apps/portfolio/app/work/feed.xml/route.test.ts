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

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

vi.mock("next/server", () => ({ connection: vi.fn(async () => undefined) }));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { connection } from "next/server";

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /work/feed.xml", () => {
  it("asks for the request before it reads anything", async () => {
    const order: string[] = [];
    vi.mocked(connection).mockImplementationOnce(async () => {
      order.push("connection");
    });
    getFeatureFlags.mockImplementationOnce(async () => {
      order.push("flags");
      return { rssFeedEnabled: false };
    });

    await GET();

    expect(order).toEqual(["connection", "flags"]);
  });

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
        { slug: "beta", full_slug: "work/group/beta" },
      ],
    });

    const response = await GET();
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/rss+xml");
    expect(body).toContain('<rss version="2.0"');
    expect(body).toContain("Alpha &lt;Project&gt;");
    expect(body).toContain("<enclosure");
    expect(body).toContain("https://example.test/work/alpha");
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

  it.each([
    ["an empty answer", () => getStories.mockResolvedValueOnce({ stories: [] })],
    ["a thrown error", () => getStories.mockRejectedValueOnce(new Error("down"))],
  ])("answers 503 instead of an empty feed on %s", async (_label, arrange) => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    getFeatureFlags.mockResolvedValueOnce({ rssFeedEnabled: true });
    arrange();

    const response = await GET();

    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBe("300");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(captureServerException).toHaveBeenCalledOnce();
  });
});
