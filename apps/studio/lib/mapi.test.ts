// @vitest-environment node
import { describe, expect, it } from "vitest";

import { mapiPath, resolveStudioAuth, STORYBLOK_MAPI } from "./mapi";

describe("resolveStudioAuth", () => {
  it("404s outside development so the routes stay local-only", () => {
    expect(
      resolveStudioAuth({
        NODE_ENV: "production",
        STORYBLOK_MANAGEMENT_TOKEN: "token",
        STORYBLOK_SPACE_ID: "123",
      }),
    ).toEqual({ ok: false, status: 404, error: "Not found" });
  });

  it("500s in development when credentials are missing", () => {
    expect(resolveStudioAuth({ NODE_ENV: "development" })).toMatchObject({
      ok: false,
      status: 500,
    });
  });

  it("returns the token and space in development", () => {
    expect(
      resolveStudioAuth({
        NODE_ENV: "development",
        STORYBLOK_MANAGEMENT_TOKEN: "token",
        STORYBLOK_SPACE_ID: "123",
      }),
    ).toEqual({ ok: true, token: "token", spaceId: "123" });
  });
});

describe("mapiPath", () => {
  it("builds a Management API URL under the space", () => {
    expect(mapiPath("123", "/stories")).toBe(`${STORYBLOK_MAPI}/spaces/123/stories`);
  });
});
