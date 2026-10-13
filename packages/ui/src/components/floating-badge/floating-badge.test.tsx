import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";

import { FloatingBadge, type FloatingBadgeAction } from "./floating-badge";

const HREF = "https://example.com/preview";
const PREVIEW: FloatingBadgeAction = {
  ariaLabel: "preview — open external preview",
  label: "preview",
  glyph: "↗",
  href: HREF,
  accented: true,
};
const EDIT: FloatingBadgeAction = {
  ariaLabel: "Edit in Storyblok",
  label: "edit",
  glyph: "✎",
  href: "https://app.storyblok.com/#/me/spaces/1/stories/0/0/2",
};

describe("FloatingBadge", () => {
  it("renders an anchor with the given href and external-link attrs", () => {
    render(<FloatingBadge actions={[PREVIEW]} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", HREF);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("portals the cluster directly into document.body, not the render container", () => {
    const { container } = render(<FloatingBadge actions={[PREVIEW]} />);
    expect(container.querySelector("[data-floating-badge]")).toBeNull();
    expect(document.body.querySelector("[data-floating-badge]")).not.toBeNull();
  });

  it("names the pill with ariaLabel and renders label + glyph", () => {
    render(<FloatingBadge actions={[PREVIEW]} />);
    const link = screen.getByRole("link", { name: "preview — open external preview" });
    expect(link).toHaveAttribute("title", "preview — open external preview");
    expect(link.textContent).toContain("preview");
    expect(link.textContent).toContain("↗");
  });

  it("keeps same-origin links in the same tab", () => {
    render(<FloatingBadge actions={[{ ...EDIT, href: "/api/exit-draft" }]} />);
    expect(screen.getByRole("link")).not.toHaveAttribute("target");
  });

  it("lets external: false override http(s) detection", () => {
    render(<FloatingBadge actions={[{ ...EDIT, external: false }]} />);
    expect(screen.getByRole("link")).not.toHaveAttribute("target");
  });

  it("applies the backdrop-filter inline so it can't be stripped by extraction", () => {
    render(<FloatingBadge actions={[PREVIEW]} />);
    const link = screen.getByRole("link") as HTMLAnchorElement;
    expect(link.style.backdropFilter).toMatch(/blur/);
    expect(link.style.backdropFilter).toMatch(/saturate/);
  });

  it("forwards refs to the cluster", () => {
    const ref = createRef<HTMLDivElement>();
    render(<FloatingBadge ref={ref} actions={[PREVIEW]} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("DIV");
    expect(ref.current).toHaveAttribute("data-floating-badge");
  });

  it("merges a custom className with the generated styles", () => {
    render(<FloatingBadge className="my-badge" actions={[PREVIEW]} />);
    expect(document.body.querySelector("[data-floating-badge]")).toHaveClass("my-badge");
  });

  it("paints an accented pill with the work accent, not the cluster", () => {
    render(<FloatingBadge accentColor="#ec6839" actions={[PREVIEW]} />);
    const cluster = document.body.querySelector("[data-floating-badge]") as HTMLElement;
    expect(cluster.style.getPropertyValue("--work-accent")).toBe("");
    const preview = screen.getByRole("link", { name: /open external preview/ });
    expect(preview.style.getPropertyValue("--work-accent")).toBe("#EC6839");
    expect(preview.style.getPropertyValue("--work-on-accent")).toBe("#ffffff");
    expect(preview.style.getPropertyValue("--work-accent-fill")).toBe("rgba(236, 104, 57, 0.62)");
  });

  it("does not tint neighboring pills when an accented pill is set", () => {
    render(<FloatingBadge accentColor="#ec6839" actions={[PREVIEW, EDIT]} />);
    expect(
      screen
        .getByRole("link", { name: "Edit in Storyblok" })
        .style.getPropertyValue("--work-accent"),
    ).toBe("");
  });

  it("lets a caller override the cluster inline style", () => {
    render(<FloatingBadge style={{ opacity: 0.5 }} actions={[PREVIEW]} />);
    const cluster = document.body.querySelector("[data-floating-badge]") as HTMLElement;
    expect(cluster.style.opacity).toBe("0.5");
  });

  it("renders multiple actions in one cluster", () => {
    render(<FloatingBadge actions={[PREVIEW, EDIT]} />);
    expect(screen.getByRole("link", { name: /open external preview/ })).toHaveAttribute(
      "href",
      HREF,
    );
    expect(screen.getByRole("link", { name: "Edit in Storyblok" })).toHaveAttribute(
      "href",
      EDIT.href,
    );
  });

  it("renders a status pill as an output", () => {
    render(
      <FloatingBadge
        actions={[
          {
            label: "draft",
            glyph: "🔍",
            ariaLabel: "Draft preview — unpublished content",
            status: true,
          },
        ]}
      />,
    );
    const status = screen.getByRole("status", { name: /draft preview/i });
    expect(status.tagName).toBe("OUTPUT");
    expect(status).toHaveTextContent("draft");
  });

  it("renders a toggle button with aria-pressed", () => {
    const onClick = vi.fn();
    render(
      <FloatingBadge
        actions={[{ ariaLabel: "Grid", label: "grid", glyph: "⊞", pressed: true, onClick }]}
      />,
    );
    const button = screen.getByRole("button", { name: "Grid" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps a focused toggle mounted when its pressed state flips", () => {
    const action: FloatingBadgeAction = { ariaLabel: "Grid", label: "grid", glyph: "⊞" };
    const { rerender } = render(<FloatingBadge actions={[{ ...action, pressed: false }]} />);
    const before = screen.getByRole("button", { name: "Grid" });
    before.focus();
    rerender(<FloatingBadge actions={[{ ...action, pressed: true }]} />);
    expect(screen.getByRole("button", { name: "Grid" })).toBe(before);
    expect(document.activeElement).toBe(before);
  });

  it("renders nothing when there are no actions", () => {
    render(<FloatingBadge actions={[]} />);
    expect(document.body.querySelector("[data-floating-badge]")).toBeNull();
    render(<FloatingBadge />);
    expect(document.body.querySelector("[data-floating-badge]")).toBeNull();
  });
});
