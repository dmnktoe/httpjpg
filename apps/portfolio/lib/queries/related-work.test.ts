// @vitest-environment node

import { beforeEach, vi } from "vitest";

vi.mock("./search-index", () => ({ getSearchIndex: vi.fn() }));
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({ captureServerException: vi.fn() }));

import type { SearchDocument } from "../search/ranking";
import { getRelatedWork } from "./related-work";
import { getSearchIndex } from "./search-index";

const mockGetSearchIndex = vi.mocked(getSearchIndex);

function doc(id: string, tagValues: string[], overrides: Partial<SearchDocument> = {}) {
  return {
    id,
    href: `/work/${id}`,
    title: id,
    kind: "work" as const,
    tags: tagValues,
    tagValues,
    excerpt: "",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getRelatedWork", () => {
  it("returns the viewed story's own tags as labels", async () => {
    mockGetSearchIndex.mockResolvedValue([doc("current", ["typescript", "ios"])]);

    await expect(getRelatedWork("/work/current")).resolves.toMatchObject({
      tags: ["TypeScript", "iOS"],
    });
  });

  it("labels the tags a neighbour shares", async () => {
    mockGetSearchIndex.mockResolvedValue([
      doc("current", ["swiftui", "ios"]),
      doc("other", ["ios"]),
    ]);

    const { related } = await getRelatedWork("/work/current");

    expect(related).toHaveLength(1);
    expect(related[0]).toMatchObject({ title: "other", href: "/work/other", sharedTags: ["iOS"] });
  });

  it("carries the first image thumbnail across", async () => {
    mockGetSearchIndex.mockResolvedValue([
      doc("current", ["ios"]),
      doc("other", ["ios"], {
        media: [
          { id: "a", kind: "audio", thumb: "", label: "track" },
          { id: "b", kind: "image", thumb: "https://img.example/x.jpg", label: "shot" },
        ],
      }),
    ]);

    const { related } = await getRelatedWork("/work/current");

    expect(related[0]?.thumb).toBe("https://img.example/x.jpg");
  });

  it("returns nothing for a path that is not in the index", async () => {
    mockGetSearchIndex.mockResolvedValue([doc("current", ["ios"])]);

    await expect(getRelatedWork("/work/missing")).resolves.toEqual({ tags: [], related: [] });
  });

  it("respects the limit", async () => {
    mockGetSearchIndex.mockResolvedValue([
      doc("current", ["ios"]),
      ...Array.from({ length: 5 }, (_, index) => doc(`other-${index}`, ["ios"])),
    ]);

    expect((await getRelatedWork("/work/current", 2)).related).toHaveLength(2);
  });

  it("degrades to nothing when the index is unavailable", async () => {
    mockGetSearchIndex.mockRejectedValue(new Error("storyblok is down"));

    await expect(getRelatedWork("/work/current")).resolves.toEqual({ tags: [], related: [] });
  });
});
