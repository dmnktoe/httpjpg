const { useStoryblokState } = vi.hoisted(() => ({ useStoryblokState: vi.fn() }));

vi.mock("@storyblok/react", () => ({
  useStoryblokState,
  StoryblokComponent: ({ blok }: { blok: { component?: string } }) => (
    <div data-testid="blok">{blok?.component}</div>
  ),
}));

import type { ISbStoryData } from "@storyblok/react";
import { render, screen, waitFor } from "@testing-library/react";

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

  it("renders the live story and syncs the light theme after mount", async () => {
    useStoryblokState.mockReturnValue({ content: { component: "page" } });

    render(<StoryblokLive story={story} />);

    await waitFor(() => {
      expect(screen.getByTestId("blok")).toHaveTextContent("page");
    });
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("syncs the dark theme for dark stories", async () => {
    useStoryblokState.mockReturnValue({ content: { component: "page", isDark: true } });

    render(<StoryblokLive story={story} />);

    await waitFor(() => {
      expect(screen.getByTestId("blok")).toHaveTextContent("page");
    });
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
