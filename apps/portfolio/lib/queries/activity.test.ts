// @vitest-environment node

import { beforeEach, vi } from "vitest";

vi.mock("@httpjpg/env", () => ({ env: { PSN_NPSSO: "npsso-token" } }));
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({ captureServerException: vi.fn() }));
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));
vi.mock("./config", () => ({ getConfig: vi.fn() }));
vi.mock("./search-index", () => ({ getSearchIndex: vi.fn() }));
vi.mock("../integrations/letterboxd", async () => {
  const actual = await vi.importActual<typeof import("../integrations/letterboxd")>(
    "../integrations/letterboxd",
  );
  return { ...actual, fetchLetterboxdFilms: vi.fn() };
});
vi.mock("../integrations/discogs", async () => {
  const actual =
    await vi.importActual<typeof import("../integrations/discogs")>("../integrations/discogs");
  return { ...actual, fetchDiscogsCollection: vi.fn() };
});
vi.mock("../integrations/psn-trophies", async () => {
  const actual = await vi.importActual<typeof import("../integrations/psn-trophies")>(
    "../integrations/psn-trophies",
  );
  return { ...actual, fetchRecentTrophies: vi.fn() };
});

import { fetchDiscogsCollection } from "../integrations/discogs";
import { fetchLetterboxdFilms } from "../integrations/letterboxd";
import { fetchRecentTrophies } from "../integrations/psn-trophies";
import {
  type ActivityEntry,
  type ActivitySources,
  getActivitySources,
  mergeActivity,
  resolveActivityConfig,
} from "./activity";
import { getConfig } from "./config";
import { getSearchIndex } from "./search-index";

const mockGetConfig = vi.mocked(getConfig);
const mockGetSearchIndex = vi.mocked(getSearchIndex);
const mockFilms = vi.mocked(fetchLetterboxdFilms);
const mockRecords = vi.mocked(fetchDiscogsCollection);
const mockTrophies = vi.mocked(fetchRecentTrophies);

function entry(id: string, date: string, kind: ActivityEntry["kind"] = "work"): ActivityEntry {
  return { id, kind, title: id, date };
}

function sources(overrides: Partial<ActivitySources> = {}): ActivitySources {
  return { work: [], films: [], records: [], trophies: [], issues: [], ...overrides };
}

describe("mergeActivity", () => {
  it("interleaves every source by date, newest first", () => {
    const merged = mergeActivity(
      sources({
        work: [entry("work-old", "2024-01-01T00:00:00.000Z")],
        films: [entry("film-new", "2026-05-01T00:00:00.000Z", "film")],
        records: [entry("record-mid", "2025-03-01T00:00:00.000Z", "record")],
      }),
    );

    expect(merged.map((item) => item.id)).toEqual(["film-new", "record-mid", "work-old"]);
  });

  it("breaks a same-timestamp tie on id so the order is stable", () => {
    const merged = mergeActivity(
      sources({
        records: [
          entry("b", "2026-01-01T00:00:00.000Z", "record"),
          entry("a", "2026-01-01T00:00:00.000Z", "record"),
        ],
      }),
    );

    expect(merged.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("respects the limit", () => {
    const many = Array.from({ length: 10 }, (_, index) =>
      entry(`w-${index}`, `2026-01-0${(index % 9) + 1}T00:00:00.000Z`),
    );

    expect(mergeActivity(sources({ work: many }), 3)).toHaveLength(3);
  });

  it("returns nothing when every source is empty", () => {
    expect(mergeActivity(sources())).toEqual([]);
  });
});

describe("resolveActivityConfig", () => {
  it("treats Letterboxd as on by default when a username is set", () => {
    expect(resolveActivityConfig({ letterboxd_username: "dmnktoe" }).letterboxd).toBe("dmnktoe");
  });

  it("treats Discogs as off by default", () => {
    expect(resolveActivityConfig({ discogs_username: "dmnktoe" }).discogs).toBeUndefined();
    expect(
      resolveActivityConfig({ discogs_enabled: true, discogs_username: "dmnktoe" }).discogs,
    ).toBe("dmnktoe");
  });

  it("drops a username the integration would reject", () => {
    expect(
      resolveActivityConfig({ letterboxd_enabled: true, letterboxd_username: "not a username!" })
        .letterboxd,
    ).toBeUndefined();
  });

  it("drops a source that is enabled but has no username", () => {
    expect(resolveActivityConfig({ letterboxd_enabled: true }).letterboxd).toBeUndefined();
  });

  it("needs both the flag and the credential for PSN", () => {
    expect(resolveActivityConfig({}).hasPsn).toBe(false);
    expect(resolveActivityConfig({ psn_trophy_enabled: true }).hasPsn).toBe(true);
  });

  it("ignores a malformed PSN username without disabling the source", () => {
    const config = resolveActivityConfig({ psn_trophy_enabled: true, psn_username: "!!" });

    expect(config.hasPsn).toBe(true);
    expect(config.psnUsername).toBe("");
  });
});

function workDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: "uuid-1",
    href: "/work/demo",
    title: "Demo",
    kind: "work" as const,
    tags: [],
    tagValues: [],
    excerpt: "",
    date: "2026-01-02",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  mockGetConfig.mockResolvedValue({} as never);
  mockGetSearchIndex.mockResolvedValue([] as never);
});

describe("getActivitySources · config", () => {
  it("degrades to an issue rather than throwing when the config is missing", async () => {
    mockGetConfig.mockRejectedValue(new Error("storyblok down"));

    const result = await getActivitySources();

    expect(result.issues).toEqual([{ source: "config", message: "Storyblok config missing" }]);
    expect(result.work).toEqual([]);
  });

  it("skips a source the config does not enable", async () => {
    await getActivitySources();

    expect(mockFilms).not.toHaveBeenCalled();
    expect(mockRecords).not.toHaveBeenCalled();
    expect(mockTrophies).not.toHaveBeenCalled();
  });
});

describe("getActivitySources · work", () => {
  it("maps published work into entries", async () => {
    mockGetSearchIndex.mockResolvedValue([workDoc({ tags: ["Swift", "iOS"] })] as never);

    const { work } = await getActivitySources();

    expect(work).toEqual([
      expect.objectContaining({
        id: "work:uuid-1",
        kind: "work",
        title: "Demo",
        detail: "Swift, iOS",
        href: "/work/demo",
      }),
    ]);
  });

  it("drops work with no date rather than inventing one", async () => {
    mockGetSearchIndex.mockResolvedValue([workDoc({ date: undefined })] as never);

    expect((await getActivitySources()).work).toEqual([]);
  });

  it("drops work whose date will not parse", async () => {
    mockGetSearchIndex.mockResolvedValue([workDoc({ date: "not-a-date" })] as never);

    expect((await getActivitySources()).work).toEqual([]);
  });

  it("ignores pages, which are not activity", async () => {
    mockGetSearchIndex.mockResolvedValue([workDoc({ kind: "page" })] as never);

    expect((await getActivitySources()).work).toEqual([]);
  });

  it("shows at most three tags as the detail", async () => {
    mockGetSearchIndex.mockResolvedValue([workDoc({ tags: ["A", "B", "C", "D"] })] as never);

    expect((await getActivitySources()).work[0]?.detail).toBe("A, B, C");
  });

  it("leaves the detail off an untagged work", async () => {
    mockGetSearchIndex.mockResolvedValue([workDoc({ tags: [] })] as never);

    expect((await getActivitySources()).work[0]?.detail).toBeUndefined();
  });

  it("records an issue when the index itself fails", async () => {
    mockGetSearchIndex.mockRejectedValue(new Error("index down"));

    const { work, issues } = await getActivitySources();

    expect(work).toEqual([]);
    expect(issues).toContainEqual({ source: "work", message: "index down" });
  });
});

describe("getActivitySources · films", () => {
  beforeEach(() => {
    mockGetConfig.mockResolvedValue({ letterboxd_username: "someone" } as never);
  });

  it("maps a watched film, with its year in the title", async () => {
    mockFilms.mockResolvedValue({
      ok: true,
      films: [
        {
          title: "Stalker",
          year: "1979",
          url: "https://letterboxd.com/x",
          watchedDate: "2026-02-01",
          rating: 4.5,
          rewatch: false,
          poster: null,
        },
      ],
    } as never);

    expect((await getActivitySources()).films).toEqual([
      expect.objectContaining({
        id: "film:https://letterboxd.com/x",
        kind: "film",
        title: "Stalker (1979)",
        detail: "★★★★½",
      }),
    ]);
  });

  it("marks a rewatch alongside the rating", async () => {
    mockFilms.mockResolvedValue({
      ok: true,
      films: [
        {
          title: "Solaris",
          year: null,
          url: "u",
          watchedDate: "2026-02-01",
          rating: 4,
          rewatch: true,
          poster: null,
        },
      ],
    } as never);

    const [film] = (await getActivitySources()).films;
    expect(film?.title).toBe("Solaris");
    expect(film?.detail).toBe("★★★★ · rewatch");
  });

  it("leaves the detail off an unrated first watch", async () => {
    mockFilms.mockResolvedValue({
      ok: true,
      films: [
        {
          title: "Solaris",
          year: null,
          url: "u",
          watchedDate: "2026-02-01",
          rating: null,
          rewatch: false,
          poster: null,
        },
      ],
    } as never);

    expect((await getActivitySources()).films[0]?.detail).toBeUndefined();
  });

  it("turns an upstream refusal into an issue naming the status", async () => {
    mockFilms.mockResolvedValue({ ok: false, status: 429, message: "rate limited" } as never);

    const { films, issues } = await getActivitySources();

    expect(films).toEqual([]);
    expect(issues).toContainEqual({
      source: "letterboxd",
      message: "Letterboxd 429: rate limited",
    });
  });

  it("keeps a film failure from taking the work list down with it", async () => {
    mockGetSearchIndex.mockResolvedValue([workDoc()] as never);
    mockFilms.mockRejectedValue(new Error("network"));

    const { work, films, issues } = await getActivitySources();

    expect(work).toHaveLength(1);
    expect(films).toEqual([]);
    expect(issues).toContainEqual({ source: "letterboxd", message: "network" });
  });
});

describe("getActivitySources · records", () => {
  beforeEach(() => {
    mockGetConfig.mockResolvedValue({
      discogs_enabled: true,
      discogs_username: "collector",
    } as never);
  });

  it("maps a release to artist — title", async () => {
    mockRecords.mockResolvedValue({
      ok: true,
      releases: [
        {
          artist: "Autechre",
          title: "Amber",
          format: "LP",
          year: "1994",
          url: "https://discogs.com/x",
          addedAt: "2026-03-01",
          thumb: null,
        },
      ],
    } as never);

    expect((await getActivitySources()).records).toEqual([
      expect.objectContaining({
        kind: "record",
        title: "Autechre — Amber",
        detail: "LP, 1994",
      }),
    ]);
  });

  it("turns an upstream refusal into an issue", async () => {
    mockRecords.mockResolvedValue({ ok: false, status: 500, message: "boom" } as never);

    expect((await getActivitySources()).issues).toContainEqual({
      source: "discogs",
      message: "Discogs 500: boom",
    });
  });
});

describe("getActivitySources · trophies", () => {
  beforeEach(() => {
    mockGetConfig.mockResolvedValue({ psn_trophy_enabled: true, psn_username: "player" } as never);
  });

  it("maps an earned trophy", async () => {
    mockTrophies.mockResolvedValue({
      ok: true,
      trophies: [
        {
          name: "Platinum",
          game: "Bloodborne",
          type: "platinum",
          earnedAt: "2026-04-01",
          url: "u",
          image: null,
        },
      ],
    } as never);

    expect((await getActivitySources()).trophies).toEqual([
      expect.objectContaining({
        kind: "trophy",
        title: "Platinum",
        detail: "platinum · Bloodborne",
      }),
    ]);
  });

  it("names the reason in the issue when PSN refuses", async () => {
    mockTrophies.mockResolvedValue({
      ok: false,
      status: 401,
      reason: "auth",
      message: "npsso expired",
    } as never);

    expect((await getActivitySources()).issues).toContainEqual({
      source: "psn",
      message: "PSN 401 (auth): npsso expired",
    });
  });
});
