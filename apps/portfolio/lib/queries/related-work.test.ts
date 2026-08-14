// @vitest-environment node

import { beforeEach, vi } from "vitest";

vi.mock("./search-index", () => ({ getSearchIndex: vi.fn() }));
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({ captureServerException: vi.fn() }));

import type { SearchDocument } from "../search/ranking";
import { getRelatedWork } from "./related-work";
import { getSearchIndex } from "./search-index";

const mockGetSearchIndex = vi.mocked(getSearchIndex);

const ASSET = "https://a.storyblok.com/f/1/1600x1200/abc/shot.jpg";

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

  it("cuts the featured image to card and list sizes", async () => {
    mockGetSearchIndex.mockResolvedValue([
      doc("current", ["ios"]),
      doc("other", ["ios"], {
        featured: { source: ASSET, focus: "100x50:101x51" },
        media: [
          { id: "a", kind: "audio", thumb: "", label: "track" },
          {
            id: "b",
            kind: "image",
            thumb: `${ASSET}/m/200x0/filters:quality(75)`,
            source: "https://a.storyblok.com/f/1/1600x1200/abc/body.jpg",
            label: "shot",
          },
        ],
      }),
    ]);

    const { related } = await getRelatedWork("/work/current");

    expect(related[0]?.thumb).toBe(
      `${ASSET}/m/1280x960/filters:quality(75):focal(100x50:1280x960)`,
    );
    expect(related[0]?.thumbSrcSet).toContain(
      `${ASSET}/m/320x240/filters:quality(75):focal(100x50:320x240) 320w`,
    );
    expect(related[0]?.square).toBe(`${ASSET}/m/120x120/filters:quality(75):focal(100x50:120x120)`);
    expect(related[0]?.squareSrcSet).toContain(
      `${ASSET}/m/40x40/filters:quality(75):focal(100x50:40x40) 40w`,
    );
  });

  it("cuts the first body image when the document predates `featured`", async () => {
    mockGetSearchIndex.mockResolvedValue([
      doc("current", ["ios"]),
      doc("other", ["ios"], {
        media: [
          { id: "a", kind: "audio", thumb: "", label: "track" },
          {
            id: "b",
            kind: "image",
            thumb: `${ASSET}/m/200x0/filters:quality(75)`,
            source: ASSET,
            label: "shot",
          },
        ],
      }),
    ]);

    const { related } = await getRelatedWork("/work/current");

    expect(related[0]?.thumb).toBe(`${ASSET}/m/1280x960/filters:quality(75)`);
    expect(related[0]?.thumbSrcSet).toContain(`${ASSET}/m/320x240/filters:quality(75) 320w`);
    expect(related[0]?.thumbSrcSet).toContain(`${ASSET}/m/1280x960/filters:quality(75) 1280w`);
    expect(related[0]?.square).toBe(`${ASSET}/m/120x120/filters:quality(75)`);
    expect(related[0]?.squareSrcSet).toContain(`${ASSET}/m/40x40/filters:quality(75) 40w`);
  });

  it("keeps the focal point across the wider crop", async () => {
    mockGetSearchIndex.mockResolvedValue([
      doc("current", ["ios"]),
      doc("other", ["ios"], {
        media: [
          { id: "b", kind: "image", thumb: "", source: ASSET, focus: "100x50:101x51", label: "" },
        ],
      }),
    ]);

    const { related } = await getRelatedWork("/work/current");

    expect(related[0]?.thumb).toContain("focal(100x50:1280x960)");
  });

  it("falls back to the indexed thumbnail when the document predates `source`", async () => {
    mockGetSearchIndex.mockResolvedValue([
      doc("current", ["ios"]),
      doc("other", ["ios"], {
        media: [{ id: "b", kind: "image", thumb: "https://img.example/x.jpg", label: "shot" }],
      }),
    ]);

    const { related } = await getRelatedWork("/work/current");

    expect(related[0]).toMatchObject({
      thumb: "https://img.example/x.jpg",
      square: "https://img.example/x.jpg",
    });
    expect(related[0]?.thumbSrcSet).toBeUndefined();
    expect(related[0]?.squareSrcSet).toBeUndefined();
  });

  it("leaves an external asset unresized", async () => {
    mockGetSearchIndex.mockResolvedValue([
      doc("current", ["ios"]),
      doc("other", ["ios"], {
        media: [
          {
            id: "b",
            kind: "image",
            thumb: "https://img.example/x.jpg",
            source: "https://img.example/x.jpg",
            label: "shot",
          },
        ],
      }),
    ]);

    const { related } = await getRelatedWork("/work/current");

    expect(related[0]).toMatchObject({
      thumb: "https://img.example/x.jpg",
      square: "https://img.example/x.jpg",
    });
    expect(related[0]?.thumbSrcSet).toBeUndefined();
    expect(related[0]?.squareSrcSet).toBeUndefined();
  });

  it("gives a neighbour with no image no thumbnail", async () => {
    mockGetSearchIndex.mockResolvedValue([
      doc("current", ["ios"]),
      doc("other", ["ios"], {
        media: [{ id: "a", kind: "audio", thumb: "", label: "track" }],
      }),
    ]);

    const { related } = await getRelatedWork("/work/current");

    expect(related[0]?.thumb).toBeUndefined();
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
