import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import { FeedPanel, type FeedPanelItem } from "./feed-panel";

const ITEMS: FeedPanelItem[] = [
  {
    id: "a",
    caption: "harbour dump",
    images: [
      { id: "a1", src: "/a1.jpg", srcSet: "/a1-320.jpg 320w", alt: "Harbour" },
      { id: "a2", src: "/a2.jpg", alt: "Ferry", fit: "contain" },
    ],
  },
  { id: "b", images: [{ id: "b1", src: "/b1.jpg", alt: "Mix cover" }] },
  { id: "c", caption: "last one", images: [{ id: "c1", src: "/c1.jpg", alt: "Roof" }] },
];

function posts(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-feed-panel-post]"));
}

function tracks(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-feed-panel-track]"));
}

function dots(container: HTMLElement): boolean[] {
  return Array.from(container.querySelectorAll("[data-feed-panel-dots] > *")).map((dot) =>
    dot.hasAttribute("data-active"),
  );
}

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  stubReducedMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("FeedPanel", () => {
  it("renders nothing without posts", () => {
    const { container } = render(<FeedPanel items={[]} href="/feed" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("is one link to the feed around a square stage", () => {
    const { container } = render(<FeedPanel items={ITEMS} href="/feed" />);

    const link = screen.getByRole("link", { name: "Open the feed" });
    expect(link).toHaveAttribute("href", "/feed");
    expect(link.querySelectorAll("img")).toHaveLength(4);
    expect(container.querySelector("[data-feed-panel-stage]")?.className).toContain("jpg-asp_1");
    expect(screen.getByText("⋆ feed")).toBeInTheDocument();
    expect(screen.getByText("01 / 03")).toBeInTheDocument();
  });

  it("fills by default and fits on request", () => {
    render(<FeedPanel items={ITEMS} href="/feed" sizes="224px" />);

    expect(screen.getByAltText("Harbour").className).toContain("jpg-obj-f_cover");
    expect(screen.getByAltText("Harbour")).toHaveAttribute("sizes", "224px");
    expect(screen.getByAltText("Ferry").className).toContain("jpg-obj-f_contain");
    expect(screen.getByAltText("Ferry")).not.toHaveAttribute("sizes");
  });

  it("slides left through a post's images, with a dot for each", () => {
    const { container } = render(<FeedPanel items={ITEMS} href="/feed" interval={1000} />);

    expect(tracks(container)[0]?.style.transform).toBe("translateX(0%)");
    expect(dots(container)).toEqual([true, false]);

    act(() => vi.advanceTimersByTime(1000));

    expect(tracks(container)[0]?.style.transform).toBe("translateX(-100%)");
    expect(dots(container)).toEqual([false, true]);
    expect(screen.getByText("01 / 03")).toBeInTheDocument();
  });

  it("brings the next post up from below and sends the old one out at the top", () => {
    const { container } = render(<FeedPanel items={ITEMS} href="/feed" interval={1000} />);

    expect(posts(container).map((post) => post.style.transform)).toEqual([
      "translateY(0%)",
      "translateY(100%)",
      "translateY(100%)",
    ]);

    act(() => vi.advanceTimersByTime(2000));

    expect(posts(container).map((post) => post.style.transform)).toEqual([
      "translateY(-100%)",
      "translateY(0%)",
      "translateY(100%)",
    ]);
    expect(tracks(container)[0]?.style.transform).toBe("translateX(-100%)");
    expect(screen.getByText("02 / 03")).toBeInTheDocument();
    expect(container.querySelector("[data-feed-panel-dots]")).toBeNull();

    act(() => vi.advanceTimersByTime(600));

    expect(posts(container)[0]?.style.transform).toBe("translateY(100%)");
    expect(tracks(container)[0]?.style.transform).toBe("translateX(0%)");
  });

  it("starts over after the last post", () => {
    const { container } = render(<FeedPanel items={ITEMS} href="/feed" interval={1000} />);

    act(() => vi.advanceTimersByTime(4000));

    expect(posts(container)[0]?.style.transform).toBe("translateY(0%)");
    expect(posts(container)[2]?.style.transform).toBe("translateY(-100%)");
    expect(screen.getByText("01 / 03")).toBeInTheDocument();
  });

  it("shows the caption of the post in view", () => {
    const { container } = render(<FeedPanel items={ITEMS} href="/feed" interval={1000} />);
    const caption = () => container.querySelector("[data-feed-panel-caption]");

    expect(caption()).toHaveTextContent("harbour dump");

    act(() => vi.advanceTimersByTime(2000));
    expect(caption()).toBeNull();

    act(() => vi.advanceTimersByTime(1000));
    expect(caption()).toHaveTextContent("last one");
  });

  it("holds still while hovered or focused", () => {
    const { container } = render(<FeedPanel items={ITEMS} href="/feed" interval={1000} />);
    const link = screen.getByRole("link");

    fireEvent.mouseEnter(link);
    act(() => vi.advanceTimersByTime(3000));
    expect(dots(container)).toEqual([true, false]);

    fireEvent.mouseLeave(link);
    fireEvent.focus(link);
    act(() => vi.advanceTimersByTime(3000));
    expect(dots(container)).toEqual([true, false]);

    fireEvent.blur(link);
    act(() => vi.advanceTimersByTime(1000));
    expect(dots(container)).toEqual([false, true]);
  });

  it("does not move for visitors who asked for less motion", () => {
    stubReducedMotion(true);
    const { container } = render(<FeedPanel items={ITEMS} href="/feed" interval={1000} />);

    act(() => vi.advanceTimersByTime(5000));

    expect(dots(container)).toEqual([true, false]);
    expect(posts(container)[0]?.style.transform).toBe("translateY(0%)");
  });

  it("shows a single image without a counter, dots or a timer", () => {
    const { container } = render(
      <FeedPanel items={ITEMS.slice(1, 2)} href="/feed" label="dumps" />,
    );

    expect(screen.getByRole("link", { name: "Open the dumps" })).toBeInTheDocument();
    expect(screen.queryByText(/01 \//)).toBeNull();
    expect(container.querySelector("[data-feed-panel-dots]")).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("loops the images of a single post", () => {
    const { container } = render(
      <FeedPanel items={ITEMS.slice(0, 1)} href="/feed" interval={1000} />,
    );

    act(() => vi.advanceTimersByTime(1000));
    expect(dots(container)).toEqual([false, true]);

    act(() => vi.advanceTimersByTime(1000));
    expect(dots(container)).toEqual([true, false]);
    expect(posts(container)[0]?.style.transform).toBe("translateY(0%)");
  });

  it("stays on a valid post when the list shrinks", () => {
    const { container, rerender } = render(
      <FeedPanel items={ITEMS} href="/feed" interval={1000} />,
    );
    act(() => vi.advanceTimersByTime(3000));

    rerender(<FeedPanel items={ITEMS.slice(0, 2)} href="/feed" interval={1000} />);

    expect(posts(container).map((post) => post.style.transform)).toContain("translateY(0%)");
    expect(screen.getByText("01 / 02")).toBeInTheDocument();
  });
});
