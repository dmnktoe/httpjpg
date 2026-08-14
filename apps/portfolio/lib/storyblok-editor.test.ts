import { vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

import { headers } from "next/headers";

import { isStoryblokEditor } from "./storyblok-editor";

const mockHeaders = vi.mocked(headers);

function headerMap(entries: Record<string, string>): Headers {
  return new Headers(entries);
}

describe("isStoryblokEditor", () => {
  it("is true when the proxy stamped the editor header", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-storyblok-editor": "1" }) as never);
    await expect(isStoryblokEditor()).resolves.toBe(true);
  });

  it("is false without the header", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-pathname": "/work/foo" }) as never);
    await expect(isStoryblokEditor()).resolves.toBe(false);
  });

  it("is false for any other header value", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-storyblok-editor": "0" }) as never);
    await expect(isStoryblokEditor()).resolves.toBe(false);
  });
});
