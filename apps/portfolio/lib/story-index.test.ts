// @vitest-environment node
import { beforeEach, vi } from "vitest";

const envObj = vi.hoisted(
  (): { NEXT_PUBLIC_STORYBLOK_TOKEN: string; STORYBLOK_API_ENDPOINT?: string } => ({
    NEXT_PUBLIC_STORYBLOK_TOKEN: "public-token",
  }),
);
vi.mock("@httpjpg/env", () => ({ env: envObj }));

import { isPublishedStory, resetStoryIndex } from "./story-index";

const fetchMock = vi.fn();
const MINUTE = 60_000;

function links(...slugs: Array<string | { slug: string; is_folder: boolean }>): Response {
  const entries = slugs.map((entry, index) => [
    `uuid-${index}`,
    typeof entry === "string" ? { slug: entry, is_folder: false } : entry,
  ]);
  return new Response(JSON.stringify({ links: Object.fromEntries(entries) }), { status: 200 });
}

beforeEach(() => {
  resetStoryIndex();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  envObj.STORYBLOK_API_ENDPOINT = undefined;
});

describe("isPublishedStory", () => {
  it("answers from the published links, folders left out", async () => {
    fetchMock.mockResolvedValue(links("home", "work/atlas", { slug: "work", is_folder: true }));

    expect(await isPublishedStory("work/atlas", 0)).toBe(true);
    expect(await isPublishedStory("work", 0)).toBe(false);
    expect(await isPublishedStory("nope", 0)).toBe(false);
  });

  it("asks Storyblok for the published links with the public token", async () => {
    fetchMock.mockResolvedValue(links("home"));

    await isPublishedStory("home", 0);

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(`${url.origin}${url.pathname}`).toBe("https://api.storyblok.com/v2/cdn/links");
    expect(url.searchParams.get("token")).toBe("public-token");
    expect(url.searchParams.get("version")).toBe("published");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ cache: "no-store" });
  });

  it("reads from a configured endpoint", async () => {
    envObj.STORYBLOK_API_ENDPOINT = "http://127.0.0.1:4000/v2/";
    fetchMock.mockResolvedValue(links("home"));

    await isPublishedStory("home", 0);

    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(
      /^http:\/\/127\.0\.0\.1:4000\/v2\/cdn\/links\?/,
    );
  });

  it("keeps the list for a while instead of asking on every request", async () => {
    fetchMock.mockResolvedValue(links("home"));

    await isPublishedStory("home", 0);
    await isPublishedStory("home", 4 * MINUTE);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockResolvedValue(links("home", "new"));
    expect(await isPublishedStory("new", 6 * MINUTE)).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("looks again for a slug missing from an older list: it may be newly published", async () => {
    fetchMock.mockResolvedValueOnce(links("home")).mockResolvedValueOnce(links("home", "fresh"));

    expect(await isPublishedStory("fresh", 0)).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(await isPublishedStory("fresh", MINUTE)).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not look again within seconds of the last read", async () => {
    fetchMock.mockResolvedValue(links("home"));

    await isPublishedStory("nope", 0);
    await isPublishedStory("nope", 3000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("matches slugs whatever their case", async () => {
    fetchMock.mockResolvedValue(links("cv", "Work/Atlas"));

    expect(await isPublishedStory("CV", 0)).toBe(true);
    expect(await isPublishedStory("work/atlas", 0)).toBe(true);
  });

  it.each([
    ["Storyblok is unreachable", () => Promise.reject(new Error("offline"))],
    ["Storyblok answers an error", () => Promise.resolve(new Response("nope", { status: 500 }))],
    ["the list comes back empty", () => Promise.resolve(links())],
  ])("does not know when %s", async (_label, respond) => {
    fetchMock.mockImplementation(respond);

    expect(await isPublishedStory("home", 0)).toBeNull();
  });

  it("keeps answering from the last good list through an outage", async () => {
    fetchMock.mockResolvedValueOnce(links("home"));
    await isPublishedStory("home", 0);

    fetchMock.mockRejectedValue(new Error("offline"));

    expect(await isPublishedStory("home", 10 * MINUTE)).toBe(true);
    expect(await isPublishedStory("nope", 10 * MINUTE)).toBeNull();
  });

  it("waits before asking again after a failed read", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));

    expect(await isPublishedStory("home", 0)).toBeNull();
    expect(await isPublishedStory("home", 10_000)).toBeNull();
    expect(await isPublishedStory("nope", 20_000)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockResolvedValue(links("home"));
    expect(await isPublishedStory("home", 40_000)).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shares one read between requests that arrive together", async () => {
    fetchMock.mockResolvedValue(links("home"));

    const answers = await Promise.all([isPublishedStory("home", 0), isPublishedStory("nope", 0)]);

    expect(answers).toEqual([true, false]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("walks every page of a large space", async () => {
    const full = Array.from({ length: 1000 }, (_, i) => `page-${i}`);
    fetchMock.mockResolvedValueOnce(links(...full)).mockResolvedValueOnce(links("last"));

    expect(await isPublishedStory("last", 0)).toBe(true);
    expect(new URL(String(fetchMock.mock.calls[1]?.[0])).searchParams.get("page")).toBe("2");
  });
});
