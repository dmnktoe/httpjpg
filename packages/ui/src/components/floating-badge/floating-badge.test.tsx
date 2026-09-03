import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import { FloatingBadge, workPreviewAction } from "./floating-badge";

const HREF = "https://example.com/preview";
const PREVIEW = workPreviewAction(HREF);
const EDIT = {
  href: "https://app.storyblok.com/#/me/spaces/1/stories/0/0/2",
  label: "edit",
  glyph: "✎",
  ariaLabel: "Edit in Storyblok",
} as const;

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
    expect(container.querySelector("[data-page-badge]")).toBeNull();
    expect(document.body.querySelector("[data-page-badge]")).not.toBeNull();
  });

  it("uses the default 'preview' label in the aria-label", () => {
    render(<FloatingBadge actions={[PREVIEW]} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("aria-label")).toContain("preview");
    expect(link.getAttribute("aria-label")).toContain("open external preview");
  });

  it("renders a custom label in the aria-label", () => {
    render(<FloatingBadge actions={[workPreviewAction(HREF, "demo site")]} />);
    expect(screen.getByRole("link").getAttribute("aria-label")).toContain("demo site");
  });

  it("renders the external-link arrow glyph", () => {
    render(<FloatingBadge actions={[PREVIEW]} />);
    expect(screen.getByRole("link").textContent).toContain("↗");
  });

  it("renders the kawaii desktop prefix in the markup (visibility is breakpoint-controlled)", () => {
    render(<FloatingBadge actions={[PREVIEW]} />);
    const text = screen.getByRole("link").textContent ?? "";
    expect(text).toContain("(っ◔◡◔)っ");
    expect(text).toContain("♥");
    expect(text).toContain("preview");
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
    expect(ref.current).toHaveAttribute("data-page-badge");
  });

  it("merges a custom className with the generated styles", () => {
    render(<FloatingBadge className="my-badge" actions={[PREVIEW]} />);
    expect(document.body.querySelector("[data-page-badge]")).toHaveClass("my-badge");
  });

  it("paints an accented pill with the work accent, not the cluster", () => {
    render(<FloatingBadge accentColor="#ec6839" actions={[PREVIEW]} />);
    const cluster = document.body.querySelector("[data-page-badge]") as HTMLElement;
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
    const cluster = document.body.querySelector("[data-page-badge]") as HTMLElement;
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

  it("renders a presentational status pill", () => {
    render(
      <FloatingBadge
        actions={[
          {
            label: "draft",
            glyph: "🔍",
            ariaLabel: "Preview mode — unpublished content",
            presentational: true,
          },
        ]}
      />,
    );
    const status = screen.getByRole("status", { name: /preview mode/i });
    expect(status.tagName).toBe("OUTPUT");
    expect(status).toHaveTextContent("draft");
  });

  it("renders a same-tab exit-draft pill", () => {
    render(
      <FloatingBadge
        actions={[
          {
            href: "/api/exit-draft",
            label: "exit",
            glyph: "×",
            ariaLabel: "Exit draft preview",
            external: false,
          },
        ]}
      />,
    );
    const link = screen.getByRole("link", { name: "Exit draft preview" });
    expect(link).toHaveAttribute("href", "/api/exit-draft");
    expect(link).not.toHaveAttribute("target");
  });

  it("renders nothing when there are no actions", () => {
    render(<FloatingBadge />);
    expect(document.body.querySelector("[data-page-badge]")).toBeNull();
  });
});
