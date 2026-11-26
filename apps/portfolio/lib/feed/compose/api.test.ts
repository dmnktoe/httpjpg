import { beforeEach, vi } from "vitest";

import {
  ComposerApiError,
  deletePost,
  hasSession,
  loadPost,
  postSlugOf,
  publishPost,
  signIn,
  signOut,
  signUpload,
  toComposerPost,
  updatePost,
} from "./api";

const fetchMock = vi.fn();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function lastCall(): [string, RequestInit] {
  return fetchMock.mock.calls.at(-1) as [string, RequestInit];
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("session", () => {
  it("asks whether the browser is signed in", async () => {
    fetchMock.mockResolvedValueOnce(json({ ok: true }));
    expect(await hasSession()).toBe(true);

    fetchMock.mockResolvedValueOnce(json({ error: "unauthorized" }, 401));
    expect(await hasSession()).toBe(false);
  });

  it("signs in with the token and out without one", async () => {
    fetchMock.mockImplementation(async () => json({ ok: true }));

    await signIn("t".repeat(40));
    expect(lastCall()[0]).toBe("/api/feed/session");
    expect(lastCall()[1]).toMatchObject({ method: "POST", credentials: "same-origin" });
    expect(JSON.parse(lastCall()[1].body as string)).toEqual({ token: "t".repeat(40) });

    await signOut();
    expect(lastCall()[1]).toMatchObject({ method: "DELETE" });
    expect(lastCall()[1].body).toBeUndefined();
  });

  it("throws the site's message when it refuses", async () => {
    fetchMock.mockResolvedValueOnce(json({ error: "unauthorized", message: "no" }, 401));

    await expect(signIn("x")).rejects.toMatchObject({ status: 401, message: "no" });
  });

  it("names the status when the refusal has no body", async () => {
    fetchMock.mockResolvedValueOnce(new Response("gateway", { status: 502 }));

    const error = await signIn("x").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ComposerApiError);
    expect((error as Error).message).toBe("Request failed (502)");
  });
});

describe("posts", () => {
  it("signs an upload", async () => {
    fetchMock.mockResolvedValueOnce(json({ id: 7, uploadUrl: "https://s3.test", fields: {} }, 201));

    expect(await signUpload({ filename: "post-1.jpg", width: 10, height: 20 })).toMatchObject({
      id: 7,
    });
    expect(lastCall()[0]).toBe("/api/feed/assets");
  });

  it("publishes, updates and deletes", async () => {
    fetchMock.mockImplementation(async () => json({ url: "/feed/abc" }));

    expect(await publishPost({ caption: "x" })).toEqual({ url: "/feed/abc" });
    expect(lastCall()).toMatchObject(["/api/feed/posts", { method: "POST" }]);

    expect(await updatePost("abc", { caption: "y" })).toEqual({ url: "/feed/abc" });
    expect(lastCall()).toMatchObject(["/api/feed/posts/abc", { method: "PATCH" }]);

    await deletePost("abc");
    expect(lastCall()).toMatchObject(["/api/feed/posts/abc", { method: "DELETE" }]);
  });

  it("loads a post for editing", async () => {
    fetchMock.mockResolvedValueOnce(
      json({
        slug: "feed/abc",
        url: "/feed/abc",
        content: {
          caption: "harbour",
          date: "2026-11-25 10:00",
          format: "4/5",
          images: [
            { _uid: "u1", fit: "contain", alt: "ferry", image: { filename: "https://x/a.jpg" } },
            { _uid: "u2", image: { filename: "" } },
            { image: { filename: "https://x/b.jpg" } },
          ],
          music: [{ source: "soundcloud", src: "https://sc/x", title: "mix", artist: "me" }],
        },
      }),
    );

    expect(await loadPost("abc")).toEqual({
      slug: "abc",
      url: "/feed/abc",
      caption: "harbour",
      date: "2026-11-25 10:00",
      format: "4/5",
      images: [{ uid: "u1", src: "https://x/a.jpg", fit: "contain", alt: "ferry" }],
      music: { source: "soundcloud", src: "https://sc/x", title: "mix", artist: "me" },
    });
  });
});

describe("toComposerPost", () => {
  it("fills in what a bare post leaves out", () => {
    expect(toComposerPost("feed/abc", "/feed/abc", {})).toEqual({
      slug: "abc",
      url: "/feed/abc",
      caption: "",
      date: "",
      format: "1/1",
      images: [],
      music: null,
    });
  });

  it("drops music without a source file and defaults its kind", () => {
    expect(toComposerPost("feed/a", "/feed/a", { music: [{ title: "x" }] }).music).toBeNull();
    expect(
      toComposerPost("feed/a", "/feed/a", { music: [{ src: "https://x/a.mp3" }] }).music,
    ).toEqual({ source: "mp3", src: "https://x/a.mp3", title: "", artist: "" });
  });
});

describe("postSlugOf", () => {
  it("takes the last segment", () => {
    expect(postSlugOf("/feed/abc/")).toBe("abc");
    expect(postSlugOf("")).toBe("");
  });
});
