import { beforeEach, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
  draftMode: vi.fn(),
}));

vi.mock("./queries/work", () => ({
  getCachedStory: vi.fn(),
}));

import { draftMode, headers } from "next/headers";

import { getPageTheme, isInternalSlug } from "./page-theme";
import { getCachedStory } from "./queries/work";

const mockHeaders = vi.mocked(headers);
const mockDraftMode = vi.mocked(draftMode);
const mockGetCachedStory = vi.mocked(getCachedStory);

function headerMap(entries: Record<string, string>): Headers {
  return new Headers(entries);
}

describe("isInternalSlug", () => {
  it.each([
    ["__nextjs_original-stack-frame", true],
    ["_next/static/foo", true],
    [".well-known/security.txt", true],
    ["work/something/.well-known/", true],
    ["work/about", false],
    ["", false],
    ["home", false],
  ])("classifies %s correctly", (slug, expected) => {
    expect(isInternalSlug(slug)).toBe(expected);
  });
});

describe("getPageTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    mockDraftMode.mockResolvedValue({ isEnabled: false } as Awaited<ReturnType<typeof draftMode>>);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("forces light theme when the request comes from the Storyblok editor", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-storyblok-editor": "1" }) as never);
    await expect(getPageTheme()).resolves.toBe("light");
    expect(mockGetCachedStory).not.toHaveBeenCalled();
  });

  it("forces light theme for internal slugs without fetching", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-pathname": "/_next/static/foo" }) as never);
    await expect(getPageTheme()).resolves.toBe("light");
    expect(mockGetCachedStory).not.toHaveBeenCalled();
  });

  it("returns dark when the resolved story has content.isDark", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-pathname": "/work/something" }) as never);
    mockGetCachedStory.mockResolvedValue({ content: { isDark: true } } as never);
    await expect(getPageTheme()).resolves.toBe("dark");
    expect(mockGetCachedStory).toHaveBeenCalledWith("work/something", { draftMode: false });
  });

  it("returns light when the story has no isDark flag", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-pathname": "/about" }) as never);
    mockGetCachedStory.mockResolvedValue({ content: {} } as never);
    await expect(getPageTheme()).resolves.toBe("light");
  });

  it("falls back to the home slug when the pathname is empty", async () => {
    mockHeaders.mockResolvedValue(headerMap({}) as never);
    mockGetCachedStory.mockResolvedValue({ content: { isDark: false } } as never);
    await getPageTheme();
    expect(mockGetCachedStory).toHaveBeenCalledWith("home", { draftMode: false });
  });

  it("strips leading and trailing slashes when deriving the slug", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-pathname": "//work/foo//" }) as never);
    mockGetCachedStory.mockResolvedValue({ content: {} } as never);
    await getPageTheme();
    expect(mockGetCachedStory).toHaveBeenCalledWith("work/foo", { draftMode: false });
  });

  it("fetches the draft version when draft mode is enabled", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-pathname": "/home" }) as never);
    mockDraftMode.mockResolvedValue({ isEnabled: true } as never);
    mockGetCachedStory.mockResolvedValue({ content: {} } as never);
    await getPageTheme();
    expect(mockGetCachedStory).toHaveBeenCalledWith("home", { draftMode: true });
  });

  it("fetches the draft version in development even without draft mode", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mockHeaders.mockResolvedValue(headerMap({ "x-pathname": "/home" }) as never);
    mockGetCachedStory.mockResolvedValue({ content: {} } as never);
    await getPageTheme();
    expect(mockGetCachedStory).toHaveBeenCalledWith("home", { draftMode: true });
  });

  it("returns light when the story lookup throws", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-pathname": "/work/foo" }) as never);
    mockGetCachedStory.mockRejectedValue(new Error("boom"));
    await expect(getPageTheme()).resolves.toBe("light");
  });

  it("returns light when getCachedStory resolves to null", async () => {
    mockHeaders.mockResolvedValue(headerMap({ "x-pathname": "/work/foo" }) as never);
    mockGetCachedStory.mockResolvedValue(null as never);
    await expect(getPageTheme()).resolves.toBe("light");
  });
});
