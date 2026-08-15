import { NextRequest } from "next/server";
import { vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

import { headers } from "next/headers";

import { isStoryblokEditor } from "./is-storyblok-editor";
import { hasStoryblokEditorParams, isStoryblokEditorRequest } from "./storyblok-editor";

const mockHeaders = vi.mocked(headers);

function headerMap(entries: Record<string, string>): Headers {
  return new Headers(entries);
}

function request(url: string, init?: HeadersInit): NextRequest {
  return new NextRequest(new URL(url, "https://www.httpjpg.com"), { headers: init });
}

describe("hasStoryblokEditorParams", () => {
  it("is true for _storyblok", () => {
    expect(hasStoryblokEditorParams(new URLSearchParams("_storyblok=1"))).toBe(true);
  });

  it("is true for any _storyblok_* key", () => {
    expect(hasStoryblokEditorParams(new URLSearchParams("_storyblok_release=2"))).toBe(true);
  });

  it("is false without storyblok params", () => {
    expect(hasStoryblokEditorParams(new URLSearchParams("_draft=1"))).toBe(false);
  });
});

describe("isStoryblokEditorRequest", () => {
  it("is true when a storyblok query param is present", () => {
    expect(isStoryblokEditorRequest(request("/work/foo?_storyblok=1"))).toBe(true);
  });

  it("is true for iframe navigations even without query params", () => {
    expect(isStoryblokEditorRequest(request("/work/foo", { "sec-fetch-dest": "iframe" }))).toBe(
      true,
    );
  });

  it("is false for top-level navigations without storyblok params", () => {
    expect(isStoryblokEditorRequest(request("/work/foo", { "sec-fetch-dest": "document" }))).toBe(
      false,
    );
  });
});

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
