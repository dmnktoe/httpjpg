vi.mock("@httpjpg/env", () => ({ env: { NEXT_PUBLIC_APP_URL: "https://httpjpg.test/" } }));

const {
  draftMode,
  notFound,
  getCachedStory,
  getAdjacentWork,
  getAuthor,
  getSiteConfig,
  getSocialProfiles,
  getFeatureFlags,
  preload,
} = vi.hoisted(() => ({
  draftMode: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  getCachedStory: vi.fn(),
  getAdjacentWork: vi.fn(),
  getAuthor: vi.fn(),
  getSiteConfig: vi.fn(),
  getSocialProfiles: vi.fn(),
  getFeatureFlags: vi.fn(),
  preload: vi.fn(),
}));

vi.mock("next/headers", () => ({ draftMode }));
vi.mock("next/navigation", () => ({ notFound }));
vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return { ...actual, default: { ...actual, preload }, preload };
});

vi.mock("@storyblok/react/rsc", () => ({
  StoryblokServerComponent: ({ blok }: { blok: { component?: string } }) => (
    <div data-testid="blok">{blok?.component}</div>
  ),
}));

vi.mock("@/components/providers/storyblok-live", () => ({
  StoryblokLive: () => <div data-testid="live" />,
}));

vi.mock("@/lib/queries/config", () => ({ getAuthor, getSiteConfig, getSocialProfiles }));
vi.mock("@/lib/queries/widgets", () => ({ getFeatureFlags }));
vi.mock("@/lib/queries/work", () => ({ getAdjacentWork, getCachedStory }));

import { render, screen } from "@testing-library/react";

import DynamicPage, { generateMetadata } from "./page";

function params(slug?: string[]) {
  return Promise.resolve({ slug });
}

function search(value: Record<string, string | string[] | undefined> = {}) {
  return Promise.resolve(value);
}

const workStory = {
  slug: "some-project",
  first_published_at: "2024-01-01",
  published_at: "2024-02-01",
  content: {
    component: "work",
    title: "Some Project",
    images: [{ filename: "https://a.storyblok.com/f/1/x.jpg", focus: "10x10" }],
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  draftMode.mockResolvedValue({ isEnabled: false });
  getFeatureFlags.mockResolvedValue({ prevNextWorkEnabled: false });
  getAuthor.mockResolvedValue(null);
  getSocialProfiles.mockResolvedValue([]);
  getSiteConfig.mockResolvedValue({
    name: "㋡httpjpg.com",
    locale: "de_DE",
    htmlLang: "de",
    language: "de-DE",
    repositoryUrl: "https://github.com/dmnktoe/httpjpg",
  });
  getAdjacentWork.mockResolvedValue({});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generateMetadata", () => {
  it("returns a Not Found title for internal slugs", async () => {
    const metadata = await generateMetadata({ params: params(["api", "draft"]) });

    expect(metadata).toEqual({ title: "Not Found" });
    expect(getCachedStory).not.toHaveBeenCalled();
  });

  it("returns a Not Found title when the story is missing", async () => {
    getCachedStory.mockResolvedValueOnce(null);

    const metadata = await generateMetadata({ params: params(["missing"]) });

    expect(metadata).toEqual({ title: "Not Found" });
  });

  it("maps the story metadata for an existing page", async () => {
    getCachedStory.mockResolvedValueOnce({
      slug: "about",
      content: { component: "page", title: "About" },
    });

    const metadata = await generateMetadata({ params: params(["about"]) });

    expect(metadata.title).toBe("About");
  });

  it("resolves the root slug when no segments are given", async () => {
    getCachedStory.mockResolvedValueOnce({ slug: "home", content: { component: "page" } });

    await generateMetadata({ params: params(undefined) });

    expect(getCachedStory).toHaveBeenCalledWith("", expect.anything());
  });

  it("fetches drafts when draft mode is enabled", async () => {
    draftMode.mockResolvedValue({ isEnabled: true });
    getCachedStory.mockResolvedValueOnce({ slug: "about", content: { component: "page" } });

    await generateMetadata({ params: params(["about"]) });

    expect(getCachedStory).toHaveBeenCalledWith("about", { draftMode: true });
  });
});

describe("DynamicPage", () => {
  it("calls notFound for internal slugs", async () => {
    await expect(
      DynamicPage({ params: params(["api", "draft"]), searchParams: search() }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
    expect(getCachedStory).not.toHaveBeenCalled();
  });

  it("calls notFound when the story does not exist", async () => {
    getCachedStory.mockResolvedValueOnce(null);

    await expect(
      DynamicPage({ params: params(["missing"]), searchParams: search() }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });

  it("renders the live preview when draft mode is enabled", async () => {
    draftMode.mockResolvedValue({ isEnabled: true });
    getCachedStory.mockResolvedValueOnce({ content: { component: "page" } });

    render(await DynamicPage({ params: params(["about"]), searchParams: search() }));

    expect(screen.getByTestId("live")).toBeInTheDocument();
  });

  it("renders the live preview when the visual editor query param is present", async () => {
    getCachedStory.mockResolvedValueOnce({ content: { component: "page" } });

    render(
      await DynamicPage({
        params: params(["about"]),
        searchParams: search({ _storyblok: "1" }),
      }),
    );

    expect(screen.getByTestId("live")).toBeInTheDocument();
    expect(getCachedStory).toHaveBeenCalledWith("about", { draftMode: true });
  });

  it("renders the live preview for the _draft query param", async () => {
    getCachedStory.mockResolvedValueOnce({ content: { component: "page" } });

    render(await DynamicPage({ params: params(["about"]), searchParams: search({ _draft: "1" }) }));

    expect(screen.getByTestId("live")).toBeInTheDocument();
  });

  it("renders a plain page without schema markup", async () => {
    getCachedStory.mockResolvedValueOnce({ content: { component: "page" } });

    render(await DynamicPage({ params: params(["about"]), searchParams: search() }));

    expect(screen.getByTestId("blok")).toHaveTextContent("page");
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
  });

  it("emits schema markup and preloads the hero image for work pages", async () => {
    getCachedStory.mockResolvedValueOnce(workStory);

    render(await DynamicPage({ params: params(["work", "some-project"]), searchParams: search() }));

    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    expect(jsonLd).not.toBeNull();
    expect(jsonLd?.textContent).toContain("Some Project");
    expect(jsonLd?.textContent).toContain("https://httpjpg.test/work/some-project");
    expect(preload).toHaveBeenCalledWith(expect.stringContaining("x.jpg"), {
      as: "image",
      fetchPriority: "high",
    });
  });

  it("includes the configured author and their profiles in the schema markup", async () => {
    getAuthor.mockResolvedValueOnce({ name: "Dominik", url: "https://httpjpg.test/about" });
    getSocialProfiles.mockResolvedValueOnce(["https://github.com/dmnktoe"]);
    getCachedStory.mockResolvedValueOnce(workStory);

    render(await DynamicPage({ params: params(["work", "some-project"]), searchParams: search() }));

    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    expect(jsonLd?.textContent).toContain("Dominik");
    expect(jsonLd?.textContent).toContain("https://github.com/dmnktoe");
  });

  it("stamps the schema language from the configured locale", async () => {
    getSiteConfig.mockResolvedValueOnce({
      name: "example.com",
      locale: "en_US",
      htmlLang: "en",
      language: "en-US",
      repositoryUrl: "https://github.com/acme/site",
    });
    getCachedStory.mockResolvedValueOnce(workStory);

    render(await DynamicPage({ params: params(["work", "some-project"]), searchParams: search() }));

    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(jsonLd?.textContent ?? "{}").inLanguage).toBe("en-US");
  });

  it("renders the work navigation when the flag is enabled", async () => {
    getFeatureFlags.mockResolvedValue({ prevNextWorkEnabled: true });
    getAdjacentWork.mockResolvedValueOnce({
      prev: { slug: "older", title: "Older" },
      next: { slug: "newer", title: "Newer" },
    });
    getCachedStory.mockResolvedValueOnce(workStory);

    render(await DynamicPage({ params: params(["work", "some-project"]), searchParams: search() }));

    expect(screen.getByRole("navigation", { name: "Work navigation" })).toBeInTheDocument();
    expect(getAdjacentWork).toHaveBeenCalledWith("some-project");
  });

  it("skips the image preload when the work page has no images", async () => {
    getCachedStory.mockResolvedValueOnce({
      ...workStory,
      content: { component: "work", title: "No Images" },
    });

    render(await DynamicPage({ params: params(["work", "no-images"]), searchParams: search() }));

    expect(preload).not.toHaveBeenCalled();
  });

  it("re-throws and logs errors raised while loading the story", async () => {
    getCachedStory.mockRejectedValueOnce(new Error("storyblok down"));

    await expect(
      DynamicPage({ params: params(["about"]), searchParams: search() }),
    ).rejects.toThrow("storyblok down");
    expect(console.error).toHaveBeenCalled();
  });

  it("logs non-Error throws as strings", async () => {
    getCachedStory.mockRejectedValueOnce("kaputt");

    await expect(DynamicPage({ params: params(["about"]), searchParams: search() })).rejects.toBe(
      "kaputt",
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("about"),
      expect.objectContaining({ error: "kaputt" }),
    );
  });
});
