// @vitest-environment node

import { beforeEach, vi } from "vitest";

vi.mock("@httpjpg/env", () => ({ env: { NEXT_PUBLIC_APP_URL: "https://www.httpjpg.com/" } }));

vi.mock("@/lib/queries/activity", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/queries/activity")>("@/lib/queries/activity");
  return { ...actual, getActivitySources: vi.fn() };
});

vi.mock("@/lib/queries/widgets", () => ({ getFeatureFlags: vi.fn() }));
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({ captureServerException: vi.fn() }));

import { type ActivitySources, getActivitySources } from "@/lib/queries/activity";
import { getFeatureFlags } from "@/lib/queries/widgets";

import { GET } from "./route";

const mockGetActivitySources = vi.mocked(getActivitySources);
const mockGetFeatureFlags = vi.mocked(getFeatureFlags);

function sources(overrides: Partial<ActivitySources> = {}): ActivitySources {
  return { work: [], films: [], records: [], trophies: [], issues: [], ...overrides };
}

const FLAGS = {
  lastUpdatedBadgeEnabled: true,
  webVitalsBadgeEnabled: false,
  buildBadgeEnabled: false,
  prevNextWorkEnabled: true,
  relatedWorkEnabled: true,
  rssFeedEnabled: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetFeatureFlags.mockResolvedValue(FLAGS);
  mockGetActivitySources.mockResolvedValue(
    sources({
      work: [
        {
          id: "work:1",
          kind: "work",
          title: "Poster Series",
          date: "2026-01-02T00:00:00.000Z",
          href: "/work/posters",
          detail: "Print",
        },
      ],
      films: [
        {
          id: "film:1",
          kind: "film",
          title: "Stalker (1979)",
          date: "2026-01-03T00:00:00.000Z",
          href: "https://letterboxd.com/x",
          thumb: "https://img.example/poster.jpg",
        },
      ],
    }),
  );
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /log/feed.xml", () => {
  it("serves RSS", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/rss+xml");
  });

  it("orders items newest first across sources", async () => {
    const xml = await (await GET()).text();

    expect(xml.indexOf("Stalker")).toBeLessThan(xml.indexOf("Poster Series"));
  });

  it("labels each item by its kind", async () => {
    const xml = await (await GET()).text();

    expect(xml).toContain("<title>Watched: Stalker (1979)</title>");
    expect(xml).toContain("<title>Published: Poster Series</title>");
    expect(xml).toContain("<category>film</category>");
  });

  it("makes a site-relative href absolute and leaves an external one alone", async () => {
    const xml = await (await GET()).text();

    expect(xml).toContain("<link>https://www.httpjpg.com/work/posters</link>");
    expect(xml).toContain("<link>https://letterboxd.com/x</link>");
  });

  it("attaches a thumbnail when the entry has one", async () => {
    const xml = await (await GET()).text();

    expect(xml).toContain('<enclosure url="https://img.example/poster.jpg"');
  });

  it("escapes characters that would break the XML", async () => {
    mockGetActivitySources.mockResolvedValue(
      sources({
        records: [
          {
            id: "record:1",
            kind: "record",
            title: 'Sun Ra — "Space <is> the Place" & more',
            date: "2026-01-01T00:00:00.000Z",
          },
        ],
      }),
    );

    const xml = await (await GET()).text();

    expect(xml).toContain("&quot;Space &lt;is&gt; the Place&quot; &amp; more");
  });

  it("marks an entry with no link as a non-permalink guid", async () => {
    mockGetActivitySources.mockResolvedValue(
      sources({
        records: [
          { id: "record:1", kind: "record", title: "Untracked", date: "2026-01-01T00:00:00.000Z" },
        ],
      }),
    );

    const xml = await (await GET()).text();

    expect(xml).toContain('<guid isPermaLink="false">https://www.httpjpg.com/log#record:1</guid>');
  });

  it("404s when the RSS feature flag is off", async () => {
    mockGetFeatureFlags.mockResolvedValue({ ...FLAGS, rssFeedEnabled: false });

    expect((await GET()).status).toBe(404);
  });

  it("answers 502 when the sources blow up entirely", async () => {
    mockGetActivitySources.mockRejectedValue(new Error("everything is on fire"));

    expect((await GET()).status).toBe(502);
  });
});
