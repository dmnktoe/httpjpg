const { useStoryblokState } = vi.hoisted(() => ({ useStoryblokState: vi.fn() }));

vi.mock("@storyblok/react", () => ({ useStoryblokState }));

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
  document.documentElement.style.removeProperty("--page-veil-rgb");
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
    expect(document.documentElement.style.getPropertyValue("--page-veil-rgb")).toBe("");
  });

  it("syncs the dark theme for dark stories", () => {
    useStoryblokState.mockReturnValue({ content: { component: "page", isDark: true } });

    render(<StoryblokLive story={story} />);

    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("tints the header veil from a work accentColor", () => {
    useStoryblokState.mockReturnValue({
      content: { component: "work", accentColor: "#84CC16" },
    });

    render(<StoryblokLive story={story} />);

    expect(document.documentElement.style.getPropertyValue("--page-veil-rgb")).toBe("132 204 22");
  });
});
