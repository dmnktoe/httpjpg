import { beforeEach, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
  draftMode: vi.fn(),
}));

vi.mock("./queries/work", () => ({
  getCachedStory: vi.fn(),
}));

import { colors } from "@httpjpg/tokens";
import { draftMode, headers } from "next/headers";

import { getPageVeilTint, hexToRgbChannels, resolveVeilTint } from "./page-accent";
import { getCachedStory } from "./queries/work";

const mockHeaders = vi.mocked(headers);
const mockDraftMode = vi.mocked(draftMode);
const mockGetCachedStory = vi.mocked(getCachedStory);

function headerMap(entries: Record<string, string>): Headers {
  return new Headers(entries);
}

describe("hexToRgbChannels", () => {
  it("converts a six-digit hex to space-separated channels", () => {
    expect(hexToRgbChannels(colors.accent[500])).toBe("132 204 22");
    expect(hexToRgbChannels("#000000")).toBe("0 0 0");
  });

  it("rejects malformed input", () => {
    expect(hexToRgbChannels("#fff")).toBeNull();
    expect(hexToRgbChannels("nope")).toBeNull();
  });
});

describe("resolveVeilTint", () => {
  it("accepts CMS color-options values", () => {
    expect(resolveVeilTint(colors.primary[500])).toBe("59 130 246");
  });

  it("rejects values outside the CMS contract", () => {
    expect(resolveVeilTint("#ff00ff")).toBeNull();
    expect(resolveVeilTint(undefined)).toBeNull();
  });
});

describe("getPageVeilTint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    mockDraftMode.mockResolvedValue({ isEnabled: false } as Awaited<ReturnType<typeof draftMode>>);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null in the Storyblok editor", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-storyblok-editor": "1" }) as never);
    await expect(getPageVeilTint()).resolves.toBeNull();
    expect(mockGetCachedStory).not.toHaveBeenCalled();
  });

  it("returns null for non-work pages", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-pathname": "/about" }) as never);
    mockGetCachedStory.mockResolvedValue({
      content: { component: "page", accentColor: colors.primary[500] },
    } as never);
    await expect(getPageVeilTint()).resolves.toBeNull();
  });

  it("returns RGB channels for a work page with accentColor", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-pathname": "/work/something" }) as never);
    mockGetCachedStory.mockResolvedValue({
      content: { component: "work", accentColor: colors.accent[500] },
    } as never);
    await expect(getPageVeilTint()).resolves.toBe("132 204 22");
  });

  it("returns null when the work page has no accent", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-pathname": "/work/something" }) as never);
    mockGetCachedStory.mockResolvedValue({ content: { component: "work" } } as never);
    await expect(getPageVeilTint()).resolves.toBeNull();
  });
});
