import { act, fireEvent, render, screen } from "@testing-library/react";

import { PageActions } from "./page-actions";
import { PageActionsProvider } from "./page-actions-provider";

const HREF = "https://external.dev";
const EDIT = "https://app.storyblok.com/#/me/spaces/7/stories/0/0/9";
const GRID = { name: "12-column overlay (G)" };

function rows(): NodeListOf<Element> {
  return document.body.querySelectorAll("[data-floating-action-bar]");
}

function grid(): Element | null {
  return document.body.querySelector("[data-page-actions-grid]");
}

describe("PageActions without a provider", () => {
  it("renders only the accented live-URL pill for published content", () => {
    render(<PageActions href={HREF} accentColor="#ec6839" />);

    const link = screen.getByRole("link", { name: /open external preview/ });
    expect(link).toHaveAttribute("href", HREF);
    expect(link.style.getPropertyValue("--work-accent")).toBe("#EC6839");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("adds draft tools for draft content (editHref)", () => {
    render(<PageActions editHref={EDIT} />);

    expect(screen.getByRole("status", { name: /draft preview/i })).toHaveTextContent("draft");
    expect(screen.getByRole("link", { name: "Edit in Storyblok" })).toHaveAttribute("href", EDIT);
    expect(screen.getByRole("link", { name: "Exit draft preview" })).toBeInTheDocument();
  });

  it("renders nothing without a URL or draft content", () => {
    render(<PageActions />);
    expect(rows()).toHaveLength(0);
  });
});

describe("PageActionsProvider", () => {
  it("renders nothing for a published page without a live URL", () => {
    render(
      <PageActionsProvider>
        <PageActions />
      </PageActionsProvider>,
    );
    expect(rows()).toHaveLength(0);
  });

  it("shows draft tools on any page while Draft Mode is on", () => {
    render(<PageActionsProvider draft />);

    expect(screen.getByRole("status", { name: /draft preview/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Exit draft preview" })).toHaveAttribute(
      "href",
      "/api/exit-draft",
    );
    expect(screen.getByRole("button", GRID)).toHaveAttribute("aria-pressed", "false");
  });

  it("draws one row with the page's live URL and draft tools", () => {
    render(
      <PageActionsProvider draft>
        <PageActions href={HREF} editHref={EDIT} accentColor="#ec6839" />
      </PageActionsProvider>,
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
      <PageActionsProvider>
        <PageActions editHref={EDIT} />
      </PageActionsProvider>,
    );
    expect(screen.getByRole("status", { name: /draft preview/i })).toBeInTheDocument();
  });

  it("hides edit and exit inside the Visual Editor", () => {
    render(
      <PageActionsProvider draft inEditor>
        <PageActions editHref={EDIT} />
      </PageActionsProvider>,
    );
    expect(screen.getByRole("status", { name: /draft preview/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Edit in Storyblok" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Exit draft preview" })).toBeNull();
    expect(screen.getByRole("button", GRID)).toBeInTheDocument();
  });

  it("clears the slot when the page unmounts", () => {
    const { rerender } = render(
      <PageActionsProvider>
        <PageActions href={HREF} />
      </PageActionsProvider>,
    );
    expect(screen.getByRole("link", { name: /open external preview/ })).toBeInTheDocument();

    rerender(<PageActionsProvider />);
    expect(rows()).toHaveLength(0);
  });

  it("keeps the next page's slot when the previous one unmounts after it", () => {
    const { rerender } = render(
      <PageActionsProvider>
        <PageActions key="a" href="https://a.dev" />
      </PageActionsProvider>,
    );
    rerender(
      <PageActionsProvider>
        <PageActions key="b" href="https://b.dev" />
      </PageActionsProvider>,
    );
    expect(screen.getByRole("link", { name: /open external preview/ })).toHaveAttribute(
      "href",
      "https://b.dev",
    );
  });
});

describe("grid overlay", () => {
  it("toggles from the grid pill without losing focus", () => {
    render(<PageActionsProvider draft />);
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
    render(<PageActionsProvider draft />);
    fireEvent.keyDown(window, { key: "g" });
    expect(grid()).not.toBeNull();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(grid()).toBeNull();
    fireEvent.keyDown(window, { key: "G" });
    expect(grid()).not.toBeNull();
  });

  it("ignores G with modifiers, while typing, or when already handled", () => {
    render(
      <PageActionsProvider draft>
        <input aria-label="field" />
      </PageActionsProvider>,
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
      <PageActionsProvider>
        <PageActions href={HREF} />
      </PageActionsProvider>,
    );
    fireEvent.keyDown(window, { key: "g" });
    expect(grid()).toBeNull();
  });
});
