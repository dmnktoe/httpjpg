import type { FeedPanelItem } from "@httpjpg/ui";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));

import { FeedPanelWidget } from "./feed-panel-widget";

const ITEMS: FeedPanelItem[] = [{ id: "a", images: [{ id: "a1", src: "/a.jpg", alt: "Harbour" }] }];

function stubViewport(isDesktop: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: query.includes("min-width") ? isDesktop : false })),
  );
}

function panel(): HTMLElement {
  return document.querySelector("[data-feed-panel]") as HTMLElement;
}

function drag(target: HTMLElement, from: [number, number], to: [number, number]) {
  fireEvent.pointerDown(target, { pointerId: 1, button: 0, clientX: from[0], clientY: from[1] });
  fireEvent.pointerMove(target, { pointerId: 1, buttons: 1, clientX: to[0], clientY: to[1] });
  fireEvent.pointerUp(target, { pointerId: 1, clientX: to[0], clientY: to[1] });
}

function clickGoesThrough(): boolean {
  return fireEvent.click(screen.getByRole("link", { name: "Open the feed" }), { detail: 1 });
}

beforeEach(() => {
  usePathname.mockReturnValue("/");
  stubViewport(true);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FeedPanelWidget", () => {
  it("shows the panel as a labelled aside linking to the feed", () => {
    render(<FeedPanelWidget items={ITEMS} />);

    expect(screen.getByRole("complementary", { name: "Latest from the feed" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open the feed" })).toHaveAttribute("href", "/feed");
  });

  it("renders nothing without posts", () => {
    const { container } = render(<FeedPanelWidget items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it.each(["/feed", "/feed/20261125-153012-a3f9"])("is hidden on %s", (pathname) => {
    usePathname.mockReturnValue(pathname);
    const { container } = render(<FeedPanelWidget items={ITEMS} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("stays on pages that merely start with the same letters", () => {
    usePathname.mockReturnValue("/feedback");
    render(<FeedPanelWidget items={ITEMS} />);

    expect(panel()).not.toBeNull();
  });

  it("moves with a drag and swallows the click that ends it", () => {
    render(<FeedPanelWidget items={ITEMS} />);

    drag(panel(), [50, 50], [120, 90]);

    expect(panel().style.left).not.toBe("");
    expect(panel().style.bottom).toBe("auto");
    expect(clickGoesThrough()).toBe(false);
    expect(clickGoesThrough()).toBe(true);
  });

  it("does not drag while it sits in the page flow on a phone", () => {
    stubViewport(false);
    render(<FeedPanelWidget items={ITEMS} />);

    drag(panel(), [50, 50], [120, 90]);

    expect(panel().style.left).toBe("");
    expect(clickGoesThrough()).toBe(true);
  });
});
