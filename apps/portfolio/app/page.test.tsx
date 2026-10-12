vi.mock("@httpjpg/env", () => ({ env: { NEXT_PUBLIC_APP_URL: "https://httpjpg.test/" } }));

const {
  draftMode,
  notFound,
  fetchStory,
  getSeoDefaults,
  getSiteConfig,
  getSearchIndex,
  getFeatureFlags,
  captureServerException,
} = vi.hoisted(() => ({
  draftMode: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  fetchStory: vi.fn(),
  getSeoDefaults: vi.fn(),
  getSiteConfig: vi.fn(),
  getSearchIndex: vi.fn(),
  getFeatureFlags: vi.fn(),
  captureServerException: vi.fn(),
}));

vi.mock("next/headers", () => ({ draftMode }));
vi.mock("next/navigation", () => ({ notFound }));
vi.mock("@httpjpg/storyblok-next", () => ({ fetchStory }));
vi.mock("@httpjpg/observability/sentry/server.ts", () => ({ captureServerException }));
vi.mock("@/lib/queries/config", () => ({ getSeoDefaults, getSiteConfig }));
vi.mock("@/lib/queries/search-index", () => ({ getSearchIndex }));
vi.mock("@/lib/queries/widgets", () => ({ getFeatureFlags }));

vi.mock("@storyblok/react/rsc", () => ({
  StoryblokServerComponent: ({ blok }: { blok: { component?: string } }) => (
    <div data-testid="blok">{blok?.component}</div>
  ),
}));

vi.mock("@/components/providers/storyblok-live", () => ({
  StoryblokLive: () => <div data-testid="live" />,
}));

import { render, screen } from "@testing-library/react";

import HomePage, { generateMetadata } from "./page";

function search(value: Record<string, string | string[] | undefined> = {}) {
  return Promise.resolve(value);
}

beforeEach(() => {
  vi.clearAllMocks();
  draftMode.mockResolvedValue({ isEnabled: false });
  getSeoDefaults.mockResolvedValue({ title: "httpjpg", description: "Portfolio" });
  getSiteConfig.mockResolvedValue({ name: "httpjpg" });
  getSearchIndex.mockResolvedValue([]);
  getFeatureFlags.mockResolvedValue({ rssFeedEnabled: false });
  document.documentElement.removeAttribute("data-theme");
});

describe("HomePage", () => {
  it("calls notFound when the home story is missing", async () => {
    fetchStory.mockResolvedValueOnce(null);

    await expect(HomePage({ searchParams: search() })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders the story and syncs the light theme", async () => {
    fetchStory.mockResolvedValueOnce({ content: { component: "page" } });

    render(await HomePage({ searchParams: search() }));

    expect(screen.getByTestId("blok")).toHaveTextContent("page");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(fetchStory).toHaveBeenCalledWith("home", expect.objectContaining({ draftMode: false }));
  });

  it("syncs the dark theme for dark stories", async () => {
    fetchStory.mockResolvedValueOnce({ content: { component: "page", isDark: true } });

    render(await HomePage({ searchParams: search() }));

    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("renders the live preview when draft mode is enabled", async () => {
    draftMode.mockResolvedValue({ isEnabled: true });
    fetchStory.mockResolvedValueOnce({ content: { component: "page" } });

    render(await HomePage({ searchParams: search() }));

    expect(screen.getByTestId("live")).toBeInTheDocument();
    expect(fetchStory).toHaveBeenCalledWith("home", expect.objectContaining({ draftMode: true }));
  });

  it("renders the live preview for the visual editor query param", async () => {
    fetchStory.mockResolvedValueOnce({ content: { component: "page" } });

    render(await HomePage({ searchParams: search({ _storyblok: "1" }) }));

    expect(screen.getByTestId("live")).toBeInTheDocument();
  });

  it("renders the live preview for the _draft query param", async () => {
    fetchStory.mockResolvedValueOnce({ content: { component: "page" } });

    render(await HomePage({ searchParams: search({ _draft: "1" }) }));

    expect(screen.getByTestId("live")).toBeInTheDocument();
  });
});

describe("HomePage schema", () => {
  function graph() {
    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    return JSON.parse(jsonLd?.textContent ?? "{}")["@graph"] as Array<Record<string, unknown>>;
  }

  it("lists internal work, newest first, as a CollectionPage", async () => {
    fetchStory.mockResolvedValueOnce({ content: { component: "page" } });
    getSearchIndex.mockResolvedValueOnce([
      { kind: "work", href: "/work/old", title: "Old", date: "2020-01-01", tags: [], excerpt: "" },
      { kind: "work", href: "/work/new", title: "New", date: "2024-01-01", tags: [], excerpt: "" },
      { kind: "work", href: "https://ext.example", title: "Ext", tags: [], excerpt: "" },
      { kind: "page", href: "/about", title: "About", tags: [], excerpt: "" },
    ]);

    render(await HomePage({ searchParams: search() }));

    const [page] = graph();
    expect(page).toMatchObject({
      "@type": "CollectionPage",
      url: "https://httpjpg.test/",
      isPartOf: { "@id": "https://httpjpg.test/#website" },
    });
    const list = page?.mainEntity as { itemListElement: Array<{ url: string }> };
    expect(list.itemListElement.map((item) => item.url)).toEqual([
      "https://httpjpg.test/work/new",
      "https://httpjpg.test/work/old",
    ]);
  });

  it("still renders an empty list when the index is unavailable", async () => {
    fetchStory.mockResolvedValueOnce({ content: { component: "page" } });
    getSearchIndex.mockRejectedValueOnce(new Error("down"));

    render(await HomePage({ searchParams: search() }));

    expect(captureServerException).toHaveBeenCalled();
    expect(graph()[0]).toMatchObject({ "@type": "CollectionPage" });
  });

  it("omits the schema when the site has no name", async () => {
    fetchStory.mockResolvedValueOnce({ content: { component: "page" } });
    getSeoDefaults.mockResolvedValueOnce({});
    getSiteConfig.mockResolvedValueOnce({});

    render(await HomePage({ searchParams: search() }));

    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});

describe("generateMetadata", () => {
  it("sets the root canonical and the home OG image", async () => {
    const metadata = await generateMetadata();

    expect(metadata.alternates).toEqual({ canonical: "/" });
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        url: "/",
        images: [expect.objectContaining({ url: "/api/og/home" })],
      }),
    );
  });

  it("links the RSS feed when enabled", async () => {
    getFeatureFlags.mockResolvedValueOnce({ rssFeedEnabled: true });

    const metadata = await generateMetadata();

    expect(metadata.alternates).toEqual({
      canonical: "/",
      types: { "application/rss+xml": "/work/feed.xml" },
    });
  });
});
