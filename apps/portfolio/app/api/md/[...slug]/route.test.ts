// @vitest-environment node

import { beforeEach, vi } from "vitest";

vi.mock("@httpjpg/env", () => ({ env: { NEXT_PUBLIC_APP_URL: "https://www.httpjpg.com/" } }));

vi.mock("@httpjpg/storyblok-next", () => ({
  fetchStory: vi.fn(),
  CACHE_TAGS: { STORY: (slug: string) => `story-${slug}`, STORIES: "stories" },
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({ captureServerException: vi.fn() }));

import { fetchStory } from "@httpjpg/storyblok-next";

import { GET } from "./route";

const mockFetchStory = vi.mocked(fetchStory);

function request(): Request {
  return new Request("http://localhost/api/md/work/demo");
}

function context(...slug: string[]) {
  return { params: Promise.resolve({ slug }) };
}

const STORY = {
  name: "Demo",
  slug: "demo",
  full_slug: "work/demo",
  first_published_at: "2026-01-02T10:00:00.000Z",
  content: {
    component: "work",
    title: "Demo Project",
    date: "2026-01-01T00:00:00.000Z",
    tags: ["typescript", "ios"],
    body: [{ component: "paragraph", text: "A stark site." }],
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchStory.mockResolvedValue(STORY as never);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/md/[...slug]", () => {
  it("serves Markdown with a shared cache header", async () => {
    const response = await GET(request(), context("work", "demo"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/markdown");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
  });

  it("heads the document with the title, canonical URL, date and tags", async () => {
    const body = await (await GET(request(), context("work", "demo"))).text();

    expect(body).toContain("# Demo Project");
    expect(body).toContain("> Source: https://www.httpjpg.com/work/demo");
    expect(body).toContain("> Date: 2026-01-01");
    expect(body).toContain("> Tags: TypeScript, iOS");
  });

  it("renders the story body", async () => {
    const body = await (await GET(request(), context("work", "demo"))).text();

    expect(body).toContain("A stark site.");
  });

  it("points the home story at the bare origin", async () => {
    mockFetchStory.mockResolvedValue({ ...STORY, full_slug: "home" } as never);

    const body = await (await GET(request(), context("home"))).text();

    expect(body).toContain("> Source: https://www.httpjpg.com/");
  });

  it("always reads published content, never draft", async () => {
    await GET(request(), context("work", "demo"));

    expect(mockFetchStory).toHaveBeenCalledWith(
      "work/demo",
      expect.objectContaining({ draftMode: false }),
    );
  });

  it("404s for a story that does not exist", async () => {
    mockFetchStory.mockResolvedValue(null as never);

    expect((await GET(request(), context("nope"))).status).toBe(404);
  });

  it("404s for an empty path", async () => {
    expect((await GET(request(), context())).status).toBe(404);
  });

  it("404s for the config story and for internal paths", async () => {
    expect((await GET(request(), context("config"))).status).toBe(404);
    expect((await GET(request(), context("api", "ask"))).status).toBe(404);
    expect(mockFetchStory).not.toHaveBeenCalled();
  });

  it("answers 502 when Storyblok errors", async () => {
    mockFetchStory.mockRejectedValue(new Error("upstream is down"));

    const response = await GET(request(), context("work", "demo"));

    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
