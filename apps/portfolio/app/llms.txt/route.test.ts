// @vitest-environment node

import { beforeEach, vi } from "vitest";

vi.mock("@httpjpg/env", () => ({ env: { NEXT_PUBLIC_APP_URL: "https://www.httpjpg.com/" } }));

vi.mock("@/lib/queries/search-index", () => ({ getSearchIndex: vi.fn() }));
vi.mock("@/lib/queries/config", () => ({ getSeoDefaults: vi.fn() }));
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({ captureServerException: vi.fn() }));

import { getSeoDefaults } from "@/lib/queries/config";
import { getSearchIndex } from "@/lib/queries/search-index";
import type { SearchDocument } from "@/lib/search/ranking";

import { GET } from "./route";

const mockGetSearchIndex = vi.mocked(getSearchIndex);
const mockGetSeoDefaults = vi.mocked(getSeoDefaults);

function doc(overrides: Partial<SearchDocument> & { title: string }): SearchDocument {
  return {
    id: overrides.title,
    href: `/work/${overrides.title.toLowerCase().replace(/\s+/g, "-")}`,
    kind: "work",
    tags: [],
    tagValues: [],
    excerpt: "",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSeoDefaults.mockResolvedValue({ title: "httpjpg", description: "A brutalist portfolio" });
  mockGetSearchIndex.mockResolvedValue([
    doc({ title: "Poster Series", tags: ["Print"], excerpt: "Riso posters", date: "2026-01-01" }),
    doc({ title: "About", href: "/about", kind: "page" }),
  ]);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /llms.txt", () => {
  it("serves plain text with a shared cache header", async () => {
    const response = await GET();

    expect(response.headers.get("Content-Type")).toContain("text/plain");
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
  });

  it("opens with the site title and description", async () => {
    const body = await (await GET()).text();

    expect(body.startsWith("# httpjpg\n")).toBe(true);
    expect(body).toContain("> A brutalist portfolio");
  });

  it("links each entry to its Markdown mirror on the absolute origin", async () => {
    const body = await (await GET()).text();

    expect(body).toContain("- [Poster Series](https://www.httpjpg.com/work/poster-series.md)");
    expect(body).toContain("- [About](https://www.httpjpg.com/about.md)");
  });

  it("splits work from other pages", async () => {
    const body = await (await GET()).text();

    expect(body.indexOf("## Work")).toBeLessThan(body.indexOf("## Pages"));
  });

  it("annotates an entry with its year, tags and excerpt", async () => {
    const body = await (await GET()).text();

    expect(body).toContain(".md): 2026 — Print — Riso posters");
  });

  it("omits a section that has no entries", async () => {
    mockGetSearchIndex.mockResolvedValue([doc({ title: "Only Work" })]);

    const body = await (await GET()).text();

    expect(body).not.toContain("## Pages");
  });

  it("leaves out stories that live off-site", async () => {
    mockGetSearchIndex.mockResolvedValue([
      doc({ title: "Elsewhere", href: "https://example.com/x" }),
      doc({ title: "Here" }),
    ]);

    const body = await (await GET()).text();

    expect(body).not.toContain("Elsewhere");
    expect(body).toContain("Here");
  });

  it("lists the feeds", async () => {
    const body = await (await GET()).text();

    expect(body).toContain("https://www.httpjpg.com/work/feed.xml");
    expect(body).toContain("https://www.httpjpg.com/log/feed.xml");
  });

  it("answers 502 rather than caching an empty site when the index is down", async () => {
    mockGetSearchIndex.mockRejectedValue(new Error("storyblok is down"));

    const response = await GET();

    expect(response.status).toBe(502);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
