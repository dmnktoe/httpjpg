// @vitest-environment node

import { beforeEach, vi } from "vitest";

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/queries/search-index", () => ({
  getSearchIndex: vi.fn(),
}));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({
  captureServerException: vi.fn(),
}));

import { captureServerException } from "@httpjpg/observability/sentry/server.ts";
import { NextRequest, NextResponse } from "next/server";

import { getSearchIndex } from "@/lib/queries/search-index";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { SearchDocument } from "@/lib/search/ranking";

import { GET } from "./route";

const mockGetSearchIndex = vi.mocked(getSearchIndex);
const mockEnforceRateLimit = vi.mocked(enforceRateLimit);

const DOCUMENTS: SearchDocument[] = [
  {
    id: "1",
    href: "/work/brutalist-portfolio",
    title: "Brutalist Portfolio",
    kind: "work",
    tags: ["Websites"],
    excerpt: "A stark site",
    date: "2026-01-01",
  },
  {
    id: "2",
    href: "/work/poster-series",
    title: "Poster Series",
    kind: "work",
    tags: ["Print"],
    excerpt: "Risograph posters",
  },
];

function get(url: string): NextRequest {
  return new NextRequest(`http://localhost${url}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockEnforceRateLimit.mockResolvedValue(null);
  mockGetSearchIndex.mockResolvedValue(DOCUMENTS);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/search", () => {
  it("returns ranked results and suggestions", async () => {
    const response = await GET(get("/api/search?q=brutalist"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.results.map((result: SearchDocument) => result.title)).toEqual([
      "Brutalist Portfolio",
    ]);
    expect(body.suggestions).toContain("Brutalist Portfolio");
  });

  it("returns empty payloads for a blank query without touching the index", async () => {
    const response = await GET(get("/api/search?q=%20%20"));

    await expect(response.json()).resolves.toEqual({ results: [], suggestions: [] });
    expect(mockGetSearchIndex).not.toHaveBeenCalled();
  });

  it("returns empty payloads when q is absent", async () => {
    const response = await GET(get("/api/search"));

    await expect(response.json()).resolves.toEqual({ results: [], suggestions: [] });
  });

  it("honours the limit parameter", async () => {
    mockGetSearchIndex.mockResolvedValue([...DOCUMENTS, ...DOCUMENTS]);

    const response = await GET(get("/api/search?q=series&limit=1"));

    expect((await response.json()).results).toHaveLength(1);
  });

  it("clamps an oversized limit", async () => {
    const many: SearchDocument[] = Array.from({ length: 30 }, (_item, index) => ({
      ...DOCUMENTS[1],
      id: String(index),
    }));
    mockGetSearchIndex.mockResolvedValue(many);

    const response = await GET(get("/api/search?q=poster&limit=999"));

    expect((await response.json()).results).toHaveLength(20);
  });

  it("falls back to the default limit for a non-numeric value", async () => {
    const many: SearchDocument[] = Array.from({ length: 12 }, (_item, index) => ({
      ...DOCUMENTS[1],
      id: String(index),
    }));
    mockGetSearchIndex.mockResolvedValue(many);

    const response = await GET(get("/api/search?q=poster&limit=abc"));

    expect((await response.json()).results).toHaveLength(8);
  });

  it("sets a shared cache header", async () => {
    const response = await GET(get("/api/search?q=poster"));

    expect(response.headers.get("Cache-Control")).toContain("s-maxage=300");
  });

  it("returns the rate-limit response when the limiter denies the request", async () => {
    mockEnforceRateLimit.mockResolvedValue(
      NextResponse.json({ error: "rate_limited" }, { status: 429 }),
    );

    const response = await GET(get("/api/search?q=poster"));

    expect(response.status).toBe(429);
    expect(mockGetSearchIndex).not.toHaveBeenCalled();
  });

  it("reports index failures and returns 500", async () => {
    mockGetSearchIndex.mockRejectedValue(new Error("index down"));

    const response = await GET(get("/api/search?q=poster"));

    expect(response.status).toBe(500);
    expect(captureServerException).toHaveBeenCalledWith(expect.any(Error), {
      tags: { route: "search" },
    });
  });

  it("prepends a work-list filter result when the query is a tag browse intent", async () => {
    const response = await GET(get("/api/search?q=TypeScript"));
    const body = await response.json();

    expect(body.results[0]).toMatchObject({
      id: "tag:typescript",
      href: "/work?tag=TypeScript",
      title: "TypeScript work",
      kind: "page",
    });
  });
});
