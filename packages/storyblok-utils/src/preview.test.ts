// @vitest-environment node
import { validateStoryblokPreviewToken } from "./preview";

async function sha1(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function params(spaceId: string, timestamp: string, token: string): URLSearchParams {
  return new URLSearchParams({
    "_storyblok_tk[space_id]": spaceId,
    "_storyblok_tk[timestamp]": timestamp,
    "_storyblok_tk[token]": token,
  });
}

describe("validateStoryblokPreviewToken", () => {
  const previewToken = "secret";
  const spaceId = "12345";

  it("rejects when the preview token is missing", async () => {
    const ts = String(Math.floor(Date.now() / 1000));
    expect(await validateStoryblokPreviewToken(params(spaceId, ts, "x"), undefined)).toBe(false);
  });

  it("rejects when required search params are absent", async () => {
    expect(await validateStoryblokPreviewToken(new URLSearchParams(), previewToken)).toBe(false);
  });

  it("rejects an expired timestamp", async () => {
    const old = String(Math.floor(Date.now() / 1000) - 7200);
    const token = await sha1(`${spaceId}:${previewToken}:${old}`);
    expect(await validateStoryblokPreviewToken(params(spaceId, old, token), previewToken)).toBe(
      false,
    );
  });

  it("rejects a non-numeric timestamp", async () => {
    expect(
      await validateStoryblokPreviewToken(params(spaceId, "not-a-number", "x"), previewToken),
    ).toBe(false);
  });

  it("rejects a token that does not match the hash", async () => {
    const ts = String(Math.floor(Date.now() / 1000));
    expect(await validateStoryblokPreviewToken(params(spaceId, ts, "wrong"), previewToken)).toBe(
      false,
    );
  });

  it("accepts a valid, fresh token", async () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const token = await sha1(`${spaceId}:${previewToken}:${ts}`);
    expect(await validateStoryblokPreviewToken(params(spaceId, ts, token), previewToken)).toBe(
      true,
    );
  });
});
