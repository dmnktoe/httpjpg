import { act, fireEvent, render, screen } from "@testing-library/react";

import { PageBadge } from "./page-badge";
import { PageBadgeProvider } from "./page-badge-provider";

const HREF = "https://external.dev";
const EDIT = "https://app.storyblok.com/#/me/spaces/7/stories/0/0/9";
const GRID = { name: "12-column overlay (G)" };

function rows(): NodeListOf<Element> {
  return document.body.querySelectorAll("[data-floating-badge]");
}

function grid(): Element | null {
  return document.body.querySelector("[data-page-badge-grid]");
}

describe("PageBadge without a provider", () => {
  it("renders only the accented live-URL pill for published content", () => {
    render(<PageBadge href={HREF} accentColor="#ec6839" />);

    const link = screen.getByRole("link", { name: /open external preview/ });
    expect(link).toHaveAttribute("href", HREF);
    expect(link.style.getPropertyValue("--work-accent")).toBe("#EC6839");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("adds draft tools for draft content (editHref)", () => {
    render(<PageBadge editHref={EDIT} />);

    expect(screen.getByRole("status", { name: /draft preview/i })).toHaveTextContent("draft");
    expect(screen.getByRole("link", { name: "Edit in Storyblok" })).toHaveAttribute("href", EDIT);
    expect(screen.getByRole("link", { name: "Exit draft preview" })).toBeInTheDocument();
  });

  it("renders nothing without a URL or draft content", () => {
    render(<PageBadge />);
    expect(rows()).toHaveLength(0);
  });
});

describe("PageBadgeProvider", () => {
  it("renders nothing for a published page without a live URL", () => {
    render(
      <PageBadgeProvider>
        <PageBadge />
      </PageBadgeProvider>,
    );
    expect(rows()).toHaveLength(0);
  });

  it("shows draft tools on any page while Draft Mode is on", () => {
    render(<PageBadgeProvider draft />);

    expect(screen.getByRole("status", { name: /draft preview/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Exit draft preview" })).toHaveAttribute(
      "href",
      "/api/exit-draft",
    );
    expect(screen.getByRole("button", GRID)).toHaveAttribute("aria-pressed", "false");
  });

  it("draws one row with the page's live URL and draft tools", () => {
    render(
      <PageBadgeProvider draft>
        <PageBadge href={HREF} editHref={EDIT} accentColor="#ec6839" />
      </PageBadgeProvider>,
    );

    expect(rows()).toHaveLength(1);
    expect(
      screen
        .getByRole("link", { name: /open external preview/ })
        .style.getPropertyValue("--work-accent"),
    ).toBe("#EC6839");
    expect(screen.getByRole("link", { name: "Edit in Storyblok" })).toHaveAttribute("href", EDIT);
    expect(
      screen
        .getByRole("status", { name: /draft preview/i })
        .style.getPropertyValue("--work-accent"),
    ).toBe("");
  });

  it("shows draft tools for draft content even without the Draft Mode cookie", () => {
    render(
      <PageBadgeProvider>
        <PageBadge editHref={EDIT} />
      </PageBadgeProvider>,
    );
    expect(screen.getByRole("status", { name: /draft preview/i })).toBeInTheDocument();
  });

  it("hides edit and exit inside the Visual Editor", () => {
    render(
      <PageBadgeProvider draft inEditor>
        <PageBadge editHref={EDIT} />
      </PageBadgeProvider>,
    );
    expect(screen.getByRole("status", { name: /draft preview/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Edit in Storyblok" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Exit draft preview" })).toBeNull();
    expect(screen.getByRole("button", GRID)).toBeInTheDocument();
  });

  it("clears the slot when the page unmounts", () => {
    const { rerender } = render(
      <PageBadgeProvider>
        <PageBadge href={HREF} />
      </PageBadgeProvider>,
    );
    expect(screen.getByRole("link", { name: /open external preview/ })).toBeInTheDocument();

    rerender(<PageBadgeProvider />);
    expect(rows()).toHaveLength(0);
  });

  it("keeps the next page's slot when the previous one unmounts after it", () => {
    const { rerender } = render(
      <PageBadgeProvider>
        <PageBadge key="a" href="https://a.dev" />
      </PageBadgeProvider>,
    );
    rerender(
      <PageBadgeProvider>
        <PageBadge key="b" href="https://b.dev" />
      </PageBadgeProvider>,
    );
    expect(screen.getByRole("link", { name: /open external preview/ })).toHaveAttribute(
      "href",
      "https://b.dev",
    );
  });
});

describe("grid overlay", () => {
  it("toggles from the grid pill without losing focus", () => {
    render(<PageBadgeProvider draft />);
    const button = screen.getByRole("button", GRID);
    button.focus();

    fireEvent.click(button);
    expect(grid()?.textContent).toContain("[ 01 ]");
    expect(grid()?.textContent).toContain("[ 12 ]");
    expect(screen.getByRole("button", GRID)).toBe(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(document.activeElement).toBe(button);

    fireEvent.click(button);
    expect(grid()).toBeNull();
  });

  it("toggles with G and closes with Escape", () => {
    render(<PageBadgeProvider draft />);
    fireEvent.keyDown(window, { key: "g" });
    expect(grid()).not.toBeNull();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(grid()).toBeNull();
    fireEvent.keyDown(window, { key: "G" });
    expect(grid()).not.toBeNull();
  });

  it("ignores G with modifiers, while typing, or when already handled", () => {
    render(
      <PageBadgeProvider draft>
        <input aria-label="field" />
      </PageBadgeProvider>,
    );
    fireEvent.keyDown(window, { key: "g", metaKey: true });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "field" }), { key: "g" });
    const handled = new KeyboardEvent("keydown", { key: "g", cancelable: true });
    handled.preventDefault();
    act(() => {
      window.dispatchEvent(handled);
    });
    expect(grid()).toBeNull();
  });

  it("does not listen for G outside draft", () => {
    render(
      <PageBadgeProvider>
        <PageBadge href={HREF} />
      </PageBadgeProvider>,
    );
    fireEvent.keyDown(window, { key: "g" });
    expect(grid()).toBeNull();
  });
});
