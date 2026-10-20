// @vitest-environment node
vi.mock("@httpjpg/env", () => ({ env: { NEXT_PUBLIC_APP_URL: "https://httpjpg.test/" } }));

const { getSearchIndex, getSiteConfig, getSeoDefaults, getAuthor, captureServerException } =
  vi.hoisted(() => ({
    getSearchIndex: vi.fn(),
    getSiteConfig: vi.fn(),
    getSeoDefaults: vi.fn(),
    getAuthor: vi.fn(),
    captureServerException: vi.fn(),
  }));

vi.mock("@httpjpg/observability/sentry/server.ts", () => ({ captureServerException }));
vi.mock("@/lib/queries/search-index", () => ({ getSearchIndex }));
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }));
vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("@/lib/queries/config", () => ({ getSiteConfig, getSeoDefaults, getAuthor }));

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  getSiteConfig.mockResolvedValue({ name: "httpjpg" });
  getSeoDefaults.mockResolvedValue({ description: "Brutalist\nportfolio" });
  getAuthor.mockResolvedValue({ name: "Domenik", url: "https://httpjpg.test" });
});

describe("GET /llms.txt", () => {
  it("renders an llmstxt.org index from the search corpus", async () => {
    getSearchIndex.mockResolvedValueOnce([
      { kind: "page", href: "/about", title: "About", tags: [], excerpt: "Hello there." },
      {
        kind: "work",
        href: "/work/old",
        title: "Old [draft]",
        tags: ["Design"],
        excerpt: "x".repeat(400),
        date: "2020-01-01",
      },
      { kind: "work", href: "/work/new", title: "New", tags: [], excerpt: "", date: "2024-01-01" },
    ]);

    const response = await GET();
    const body = await response.text();

    expect(response.headers.get("content-type")).toMatch(/text\/markdown/);
    expect(body.startsWith("# httpjpg\n\n> Brutalist portfolio\n")).toBe(true);
    expect(body).toContain("Portfolio of Domenik (https://httpjpg.test).");
    expect(body.indexOf("/work/new")).toBeLessThan(body.indexOf("/work/old"));
    expect(body).toContain("- [New](https://httpjpg.test/work/new)\n");
    expect(body).toContain("- [Old draft](https://httpjpg.test/work/old): Design — ");
    expect(body).toContain("…");
    expect(body).toContain("## Pages\n\n- [About](https://httpjpg.test/about): Hello there.");
    expect(body).toContain("- [Sitemap](https://httpjpg.test/sitemap.xml)");
  });

  it("503s and reports when the index is unavailable", async () => {
    getSearchIndex.mockRejectedValueOnce(new Error("down"));

    const response = await GET();

    expect(response.status).toBe(503);
    expect(captureServerException).toHaveBeenCalled();
  });
});
