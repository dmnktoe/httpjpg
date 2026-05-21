import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import { FloatingPreviewBadge } from "./floating-preview-badge";

const HREF = "https://example.com/preview";

describe("FloatingPreviewBadge", () => {
  it("renders an anchor with the given href and external-link attrs", () => {
    render(<FloatingPreviewBadge href={HREF} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", HREF);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("portals the anchor directly into document.body, not the render container", () => {
    const { container } = render(<FloatingPreviewBadge href={HREF} />);
    expect(container.querySelector("a")).toBeNull();
    expect(document.body.querySelector(`a[href='${HREF}']`)).not.toBeNull();
  });

  it("uses the default 'preview' label in the aria-label", () => {
    render(<FloatingPreviewBadge href={HREF} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("aria-label")).toContain("preview");
    expect(link.getAttribute("aria-label")).toContain("open external preview");
  });

  it("renders a custom label in the aria-label", () => {
    render(<FloatingPreviewBadge href={HREF} label="demo site" />);
    expect(screen.getByRole("link").getAttribute("aria-label")).toContain("demo site");
  });

  it("renders the external-link arrow glyph", () => {
    render(<FloatingPreviewBadge href={HREF} />);
    expect(screen.getByRole("link").textContent).toContain("↗");
  });

  it("renders the kawaii desktop prefix in the markup (visibility is breakpoint-controlled)", () => {
    render(<FloatingPreviewBadge href={HREF} />);
    const text = screen.getByRole("link").textContent ?? "";
    expect(text).toContain("(っ◔◡◔)っ");
    expect(text).toContain("♥");
    expect(text).toContain("preview");
  });

  it("applies the backdrop-filter inline so it can't be stripped by extraction", () => {
    render(<FloatingPreviewBadge href={HREF} />);
    const link = screen.getByRole("link") as HTMLAnchorElement;
    expect(link.style.backdropFilter).toMatch(/blur/);
    expect(link.style.backdropFilter).toMatch(/saturate/);
  });

  it("forwards refs to the underlying anchor", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<FloatingPreviewBadge href={HREF} ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("A");
    expect(ref.current?.href).toBe(`${HREF}`);
  });

  it("merges a custom className with the generated styles", () => {
    render(<FloatingPreviewBadge href={HREF} className="my-badge" />);
    expect(screen.getByRole("link")).toHaveClass("my-badge");
  });

  it("forwards arbitrary anchor props through to the element", () => {
    render(<FloatingPreviewBadge href={HREF} data-testid="badge" id="external-preview" />);
    const link = screen.getByTestId("badge");
    expect(link).toHaveAttribute("id", "external-preview");
  });

  it("lets a caller override the inline style without losing backdrop-filter", () => {
    render(<FloatingPreviewBadge href={HREF} style={{ opacity: 0.5 }} />);
    const link = screen.getByRole("link") as HTMLAnchorElement;
    expect(link.style.opacity).toBe("0.5");
    expect(link.style.backdropFilter).toMatch(/blur/);
  });
});
