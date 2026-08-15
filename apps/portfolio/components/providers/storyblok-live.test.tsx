const { useStoryblokState } = vi.hoisted(() => ({ useStoryblokState: vi.fn() }));

vi.mock("@storyblok/react", () => ({ useStoryblokState }));

vi.mock("@httpjpg/spotify", () => ({
  extractVibrantColor: vi.fn().mockResolvedValue(null),
}));

vi.mock("@storyblok/react/rsc", () => ({
  StoryblokServerComponent: ({ blok }: { blok: { component?: string } }) => (
    <div data-testid="blok">{blok?.component}</div>
  ),
}));

import type { ISbStoryData } from "@storyblok/react";
import { render, screen } from "@testing-library/react";

import { StoryblokLive } from "./storyblok-live";

const story = { content: { component: "page" } } as unknown as ISbStoryData;

beforeEach(() => {
  vi.clearAllMocks();
  document.documentElement.removeAttribute("data-theme");
});

describe("StoryblokLive", () => {
  it("renders nothing while the bridge state has no story", () => {
    useStoryblokState.mockReturnValue(undefined);

    const { container } = render(<StoryblokLive story={story} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the story has no content", () => {
    useStoryblokState.mockReturnValue({});

    const { container } = render(<StoryblokLive story={story} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the live story and syncs the light theme", () => {
    useStoryblokState.mockReturnValue({ content: { component: "page" } });

    render(<StoryblokLive story={story} />);

    expect(screen.getByTestId("blok")).toHaveTextContent("page");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("syncs the dark theme for dark stories", () => {
    useStoryblokState.mockReturnValue({ content: { component: "page", isDark: true } });

    render(<StoryblokLive story={story} />);

    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
