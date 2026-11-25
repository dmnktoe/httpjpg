import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import { FeedPanel, type FeedPanelItem } from "./feed-panel";

const ITEMS: FeedPanelItem[] = [
  { id: "a", src: "/a.jpg", srcSet: "/a-320.jpg 320w", alt: "Harbour" },
  { id: "b", src: "/b.jpg", alt: "Ferry", fit: "contain" },
  { id: "c", src: "/c.jpg", alt: "Mix cover" },
];

function track(container: HTMLElement): HTMLElement {
  return container.querySelector("[data-feed-panel-track]") as HTMLElement;
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

  it("is one link to the feed around every image", () => {
    render(<FeedPanel items={ITEMS} href="/feed" />);

    const link = screen.getByRole("link", { name: "Open the feed" });
    expect(link).toHaveAttribute("href", "/feed");
    expect(link.querySelectorAll("img")).toHaveLength(3);
    expect(link.className).toContain("jpg-asp_1");
    expect(screen.getByText("⋆ feed")).toBeInTheDocument();
  });

  it("fills by default and fits on request", () => {
    render(<FeedPanel items={ITEMS} href="/feed" sizes="224px" />);

    expect(screen.getByAltText("Harbour").className).toContain("jpg-obj-f_cover");
    expect(screen.getByAltText("Harbour")).toHaveAttribute("sizes", "224px");
    expect(screen.getByAltText("Ferry").className).toContain("jpg-obj-f_contain");
    expect(screen.getByAltText("Ferry")).not.toHaveAttribute("sizes");
  });

  it("scrolls to the next post on each interval and wraps", () => {
    const { container } = render(<FeedPanel items={ITEMS} href="/feed" interval={1000} />);

    expect(track(container).style.transform).toBe("translateX(0%)");
    expect(screen.getByText("[ 01 / 03 ]")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1000));
    expect(track(container).style.transform).toBe("translateX(-100%)");

    act(() => vi.advanceTimersByTime(2000));
    expect(track(container).style.transform).toBe("translateX(0%)");
    expect(screen.getByText("[ 01 / 03 ]")).toBeInTheDocument();
  });

  it("holds still while hovered or focused", () => {
    const { container } = render(<FeedPanel items={ITEMS} href="/feed" interval={1000} />);
    const link = screen.getByRole("link");

    fireEvent.mouseEnter(link);
    act(() => vi.advanceTimersByTime(3000));
    expect(track(container).style.transform).toBe("translateX(0%)");

    fireEvent.mouseLeave(link);
    fireEvent.focus(link);
    act(() => vi.advanceTimersByTime(3000));
    expect(track(container).style.transform).toBe("translateX(0%)");

    fireEvent.blur(link);
    act(() => vi.advanceTimersByTime(1000));
    expect(track(container).style.transform).toBe("translateX(-100%)");
  });

  it("does not move for visitors who asked for less motion", () => {
    stubReducedMotion(true);
    const { container } = render(<FeedPanel items={ITEMS} href="/feed" interval={1000} />);

    act(() => vi.advanceTimersByTime(5000));

    expect(track(container).style.transform).toBe("translateX(0%)");
  });

  it("shows a single post without a counter or a timer", () => {
    render(<FeedPanel items={ITEMS.slice(0, 1)} href="/feed" label="dumps" />);

    expect(screen.getByRole("link", { name: "Open the dumps" })).toBeInTheDocument();
    expect(screen.queryByText(/\[ 01/)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stays on a valid post when the list shrinks", () => {
    const { container, rerender } = render(
      <FeedPanel items={ITEMS} href="/feed" interval={1000} />,
    );
    act(() => vi.advanceTimersByTime(2000));

    rerender(<FeedPanel items={ITEMS.slice(0, 2)} href="/feed" interval={1000} />);

    expect(track(container).style.transform).toBe("translateX(0%)");
  });
});
