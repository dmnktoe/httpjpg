// @vitest-environment node
import { beforeEach, vi } from "vitest";

const envObj = vi.hoisted(
  (): { STORYBLOK_MANAGEMENT_TOKEN?: string; STORYBLOK_SPACE_ID?: string } => ({}),
);
vi.mock("@httpjpg/env", () => ({ env: envObj }));

import {
  createPublishedStory,
  deleteAsset,
  deleteStory,
  ensureFolder,
  findStory,
  finishAssetUpload,
  getStory,
  isAssetUsedElsewhere,
  mapiConfig,
  signAssetUpload,
  StoryblokMapiError,
  updatePublishedStory,
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

describe("findStory", () => {
  it("finds the story at exactly this slug", async () => {
    fetchMock.mockResolvedValue(
      json({
        stories: [
          { id: 1, full_slug: "feed/a", is_folder: true },
          { id: 2, full_slug: "feed/a-b" },
          { id: 3, full_slug: "feed/a" },
        ],
      }),
    );

    expect(await findStory(CONFIG, "feed/a")).toEqual({ id: 3, fullSlug: "feed/a" });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${BASE}/stories?with_slug=feed%2Fa`);
  });

  it("answers null when there is none", async () => {
    fetchMock.mockResolvedValue(json({}));

    expect(await findStory(CONFIG, "feed/a")).toBeNull();
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

describe("getStory", () => {
  it("reads one story with its content", async () => {
    fetchMock.mockResolvedValueOnce(
      json({ story: { id: 12, name: "harbour", full_slug: "feed/a", content: { caption: "x" } } }),
    );

    expect(await getStory(CONFIG, 12)).toEqual({
      id: 12,
      fullSlug: "feed/a",
      name: "harbour",
      content: { caption: "x" },
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${BASE}/stories/12`);
  });

  it("tolerates a story without a name and rejects one without content", async () => {
    fetchMock.mockResolvedValueOnce(json({ story: { id: 12, full_slug: "feed/a", content: {} } }));
    expect((await getStory(CONFIG, 12)).name).toBe("");

    fetchMock.mockResolvedValueOnce(json({ story: { id: 12, full_slug: "feed/a" } }));
    await expect(getStory(CONFIG, 12)).rejects.toBeInstanceOf(StoryblokMapiError);
  });
});

describe("updatePublishedStory", () => {
  it("replaces the content and publishes in one call", async () => {
    fetchMock.mockResolvedValueOnce(json({ story: { id: 12, full_slug: "feed/a" } }));

    expect(
      await updatePublishedStory(CONFIG, 12, { name: "harbour", content: { caption: "y" } }),
    ).toEqual({ id: 12, fullSlug: "feed/a" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/stories/12?publish=1`);
    expect(init.method).toBe("PUT");
    expect(lastBody()).toEqual({
      story: { name: "harbour", content: { caption: "y" } },
      publish: 1,
    });
  });

  it("rejects a response without the story", async () => {
    fetchMock.mockResolvedValueOnce(json({}));

    await expect(
      updatePublishedStory(CONFIG, 12, { name: "x", content: {} }),
    ).rejects.toBeInstanceOf(StoryblokMapiError);
  });
});

describe("deleting", () => {
  it("deletes a story and an asset, also when Storyblok answers with nothing", async () => {
    fetchMock.mockResolvedValueOnce(json({ story: { id: 12 } }));
    await deleteStory(CONFIG, 12);
    expect(fetchMock.mock.calls[0]).toMatchObject([`${BASE}/stories/12`, { method: "DELETE" }]);

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await deleteAsset(CONFIG, 7);
    expect(fetchMock.mock.calls[1]).toMatchObject([`${BASE}/assets/7`, { method: "DELETE" }]);
  });

  it("fails when Storyblok refuses", async () => {
    fetchMock.mockResolvedValueOnce(json({ error: "nope" }, 404));

    await expect(deleteStory(CONFIG, 12)).rejects.toMatchObject({ status: 404 });
  });
});

describe("isAssetUsedElsewhere", () => {
  const FILE = "https://a.storyblok.com/f/42/800x800/8868632e3c/print.jpeg";

  it("searches story text for the file's own path segment", async () => {
    fetchMock.mockResolvedValueOnce(json({ stories: [{ id: 12 }] }));

    expect(await isAssetUsedElsewhere(CONFIG, FILE, 12)).toBe(false);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${BASE}/stories?text_search=8868632e3c&per_page=5`);
  });

  it("counts any other story as a user", async () => {
    fetchMock.mockResolvedValueOnce(json({ stories: [{ id: 12 }, { id: 99 }] }));

    expect(await isAssetUsedElsewhere(CONFIG, FILE, 12)).toBe(true);
  });

  it("trusts nothing a search says that does not even find the post", async () => {
    fetchMock.mockResolvedValueOnce(json({ stories: [] }));
    expect(await isAssetUsedElsewhere(CONFIG, FILE, 12)).toBe(true);

    fetchMock.mockResolvedValueOnce(json({}));
    expect(await isAssetUsedElsewhere(CONFIG, FILE, 12)).toBe(true);
  });

  it("does not search for a file it cannot name", async () => {
    expect(await isAssetUsedElsewhere(CONFIG, "https://cdn.test/a.mp4", 12)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
