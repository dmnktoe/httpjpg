const { draftMode, notFound, fetchStory } = vi.hoisted(() => ({
  draftMode: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  fetchStory: vi.fn(),
}));

vi.mock("next/headers", () => ({ draftMode }));
vi.mock("next/navigation", () => ({ notFound }));
vi.mock("@httpjpg/storyblok-next", () => ({ fetchStory }));

vi.mock("@storyblok/react/rsc", () => ({
  StoryblokServerComponent: ({ blok }: { blok: { component?: string } }) => (
    <div data-testid="blok">{blok?.component}</div>
  ),
}));

vi.mock("@/components/providers/storyblok-live", () => ({
  StoryblokLive: () => <div data-testid="live" />,
}));

import { render, screen } from "@testing-library/react";

import HomePage from "./page";

function search(value: Record<string, string | string[] | undefined> = {}) {
  return Promise.resolve(value);
}

beforeEach(() => {
  vi.clearAllMocks();
  draftMode.mockResolvedValue({ isEnabled: false });
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
