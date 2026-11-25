// @vitest-environment node
import { beforeEach, vi } from "vitest";

const envObj = vi.hoisted(
  (): { STORYBLOK_MANAGEMENT_TOKEN?: string; STORYBLOK_SPACE_ID?: string } => ({}),
);
vi.mock("@httpjpg/env", () => ({ env: envObj }));

import {
  createPublishedStory,
  ensureFolder,
  finishAssetUpload,
  mapiConfig,
  signAssetUpload,
  StoryblokMapiError,
} from "./storyblok-mapi";

const CONFIG = { token: "pat", spaceId: "42" };
const BASE = "https://mapi.storyblok.com/v1/spaces/42";
const fetchMock = vi.fn();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function lastBody(): unknown {
  const init = fetchMock.mock.calls.at(-1)?.[1] as RequestInit;
  return JSON.parse(init.body as string);
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("mapiConfig", () => {
  it("needs both the token and the space", () => {
    envObj.STORYBLOK_MANAGEMENT_TOKEN = "pat";
    envObj.STORYBLOK_SPACE_ID = undefined;
    expect(mapiConfig()).toBeNull();

    envObj.STORYBLOK_SPACE_ID = "42";
    expect(mapiConfig()).toEqual(CONFIG);
  });
});

describe("signAssetUpload", () => {
  it("asks Storyblok for a validated signed upload", async () => {
    fetchMock.mockResolvedValue(
      json({ id: 7, post_url: "https://s3.test/bucket", fields: { key: "f/42/a.jpg" } }),
    );

    const upload = await signAssetUpload(CONFIG, { filename: "a.jpg", size: "800x600" });

    expect(upload).toEqual({
      id: 7,
      uploadUrl: "https://s3.test/bucket",
      fields: { key: "f/42/a.jpg" },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/assets/`,
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        headers: { Authorization: "pat", "Content-Type": "application/json" },
      }),
    );
    expect(lastBody()).toEqual({ filename: "a.jpg", size: "800x600", validate_upload: 1 });
  });

  it("omits the size of a file without dimensions", async () => {
    fetchMock.mockResolvedValue(json({ id: 7, post_url: "https://s3.test", fields: {} }));

    await signAssetUpload(CONFIG, { filename: "mix.mp3" });

    expect(lastBody()).toEqual({ filename: "mix.mp3", validate_upload: 1 });
  });

  it("rejects a response without the upload target", async () => {
    fetchMock.mockResolvedValue(json({ id: 7 }));

    await expect(signAssetUpload(CONFIG, { filename: "a.jpg" })).rejects.toThrow(/malformed/);
  });

  it("carries Storyblok's status on a failure", async () => {
    fetchMock.mockResolvedValue(new Response("Unauthorized", { status: 401 }));

    const error = await signAssetUpload(CONFIG, { filename: "a.jpg" }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(StoryblokMapiError);
    expect((error as StoryblokMapiError).status).toBe(401);
    expect((error as StoryblokMapiError).message).toContain("POST /assets/ failed (401)");
  });
});

describe("finishAssetUpload", () => {
  it("returns the CDN URL of the finished asset", async () => {
    fetchMock.mockResolvedValue(
      json({ id: 7, filename: "https://s3.amazonaws.com/a.storyblok.com/f/42/800x600/abc/a.jpg" }),
    );

    const filename = await finishAssetUpload(CONFIG, 7);

    expect(filename).toBe("https://a.storyblok.com/f/42/800x600/abc/a.jpg");
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${BASE}/assets/7/finish_upload`);
  });

  it("reads a wrapped asset and a protocol-relative URL", async () => {
    fetchMock.mockResolvedValue(
      json({ asset: { filename: "//a.storyblok.com/f/42/abc/mix.mp3" } }),
    );

    expect(await finishAssetUpload(CONFIG, 7)).toBe("https://a.storyblok.com/f/42/abc/mix.mp3");
  });

  it("reads the asset itself when the finish response has no URL", async () => {
    fetchMock
      .mockResolvedValueOnce(json({}))
      .mockResolvedValueOnce(json({ filename: "https://a.storyblok.com/f/42/abc/a.jpg" }));

    expect(await finishAssetUpload(CONFIG, 7)).toBe("https://a.storyblok.com/f/42/abc/a.jpg");
    expect(fetchMock.mock.calls[1]?.[0]).toBe(`${BASE}/assets/7`);
  });

  it("fails when the asset has no file", async () => {
    fetchMock.mockImplementation(async () => json({}));

    await expect(finishAssetUpload(CONFIG, 7)).rejects.toThrow("asset 7 has no file");
  });
});

describe("ensureFolder", () => {
  it("reuses the existing folder", async () => {
    fetchMock.mockResolvedValue(
      json({
        stories: [
          { id: 3, is_folder: false },
          { id: 4, is_folder: true },
        ],
      }),
    );

    expect(await ensureFolder(CONFIG, { slug: "feed", name: "Feed" })).toBe(4);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${BASE}/stories?with_slug=feed`);
  });

  it("creates the folder on first use", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ stories: [] }))
      .mockResolvedValueOnce(json({ story: { id: 9 } }));

    expect(await ensureFolder(CONFIG, { slug: "feed", name: "Feed" })).toBe(9);
    expect(lastBody()).toEqual({
      story: { name: "Feed", slug: "feed", is_folder: true, parent_id: 0 },
    });
  });

  it("fails when Storyblok does not return the new folder", async () => {
    fetchMock.mockResolvedValueOnce(json({})).mockResolvedValueOnce(json({}));

    await expect(ensureFolder(CONFIG, { slug: "feed", name: "Feed" })).rejects.toThrow(/folder/);
  });
});

describe("createPublishedStory", () => {
  const story = {
    name: "harbour",
    slug: "20261125-153012-a3f9",
    parentId: 4,
    content: { component: "post" },
  };

  it("creates and publishes in one call", async () => {
    fetchMock.mockResolvedValue(
      json({ story: { id: 12, full_slug: "feed/20261125-153012-a3f9" } }),
    );

    expect(await createPublishedStory(CONFIG, story)).toEqual({
      id: 12,
      fullSlug: "feed/20261125-153012-a3f9",
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${BASE}/stories?publish=1`);
    expect(lastBody()).toEqual({
      story: {
        name: "harbour",
        slug: "20261125-153012-a3f9",
        parent_id: 4,
        content: { component: "post" },
      },
      publish: 1,
    });
  });

  it("rejects a response without the story", async () => {
    fetchMock.mockResolvedValue(json({ story: { id: 12 } }));

    await expect(createPublishedStory(CONFIG, story)).rejects.toThrow(/malformed story/);
  });
});
