// @vitest-environment node

import { vi } from "vitest";

vi.mock("@httpjpg/env", () => ({ env: { PSN_NPSSO: "npsso-token" } }));

import {
  type ActivityEntry,
  type ActivitySources,
  mergeActivity,
  resolveActivityConfig,
} from "./activity";

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
