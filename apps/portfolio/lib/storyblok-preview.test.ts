// @vitest-environment node
import { createHash } from "node:crypto";

import { afterEach, vi } from "vitest";

const { connection } = vi.hoisted(() => ({ connection: vi.fn() }));
vi.mock("@httpjpg/env", () => ({ env: { STORYBLOK_PREVIEW_TOKEN: "preview-token" } }));
vi.mock("next/server", () => ({ connection }));

import { hasSignedStoryblokToken, isVisualEditorRequest } from "./storyblok-preview";

function signed(previewToken = "preview-token", ageSeconds = 0) {
  const timestamp = String(Math.floor(Date.now() / 1000) - ageSeconds);
  const token = createHash("sha1").update(`4711:${previewToken}:${timestamp}`).digest("hex");
  return {
    "_storyblok_tk[space_id]": "4711",
    "_storyblok_tk[timestamp]": timestamp,
    "_storyblok_tk[token]": token,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("hasSignedStoryblokToken", () => {
  it("accepts a token Storyblok signed with the preview token", async () => {
    expect(await hasSignedStoryblokToken(signed())).toBe(true);
    expect(connection).toHaveBeenCalled();
  });

  it("does not wait for a request when there is no token to check", async () => {
    connection.mockClear();

    expect(await hasSignedStoryblokToken({ _storyblok: "1" })).toBe(false);
    expect(connection).not.toHaveBeenCalled();
  });

  it.each([
    ["no token", {}],
    ["a token signed with another secret", signed("someone-elses")],
    ["a token older than an hour", signed("preview-token", 2 * 3600)],
    ["a repeated parameter", { ...signed(), "_storyblok_tk[token]": ["a", "b"] }],
  ])("rejects %s", async (_label, search) => {
    expect(await hasSignedStoryblokToken(search)).toBe(false);
  });
});

describe("isVisualEditorRequest", () => {
  it.each([
    ["_draft", { _draft: "1" }],
    ["_storyblok", { _storyblok: "1" }],
  ])("does not trust a bare %s parameter", async (_label, search) => {
    expect(await isVisualEditorRequest(search, false)).toBe(false);
  });

  it("trusts the markers in draft mode", async () => {
    expect(await isVisualEditorRequest({ _draft: "1" }, true)).toBe(true);
  });

  it("trusts the markers on a request Storyblok signed", async () => {
    expect(await isVisualEditorRequest({ _storyblok: "1", ...signed() }, false)).toBe(true);
  });

  it("trusts the markers in development", async () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(await isVisualEditorRequest({ _storyblok: "1" }, false)).toBe(true);
  });

  it("is not the editor without a marker, signed or not", async () => {
    expect(await isVisualEditorRequest(signed(), true)).toBe(false);
  });
});
