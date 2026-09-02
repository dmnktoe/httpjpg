import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ScrollClipImage } from "./scroll-clip-image";

vi.hoisted(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(function matchMedia(query: string) {
      return {
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  );

  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn().mockImplementation(function IntersectionObserver() {
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    }),
  );
});

describe("ScrollClipImage", () => {
  it("renders an image with src and alt", () => {
    render(<ScrollClipImage src="/test.jpg" alt="Test image" />);
    const img = screen.getByRole("img", { name: "Test image" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/test.jpg");
  });

  it("renders corner brackets by default", () => {
    const { container } = render(<ScrollClipImage src="/test.jpg" alt="Test" />);
    expect(container.textContent).toContain("┌");
    expect(container.textContent).toContain("┘");
  });

  it("hides brackets when disabled", () => {
    const { container } = render(<ScrollClipImage src="/test.jpg" alt="Test" brackets={false} />);
    expect(container.textContent).not.toContain("┌");
  });

  it("wraps in a link when href is provided", () => {
    render(<ScrollClipImage src="/test.jpg" alt="Test" href="/project" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/project");
  });

  it("does not render a link by default", () => {
    render(<ScrollClipImage src="/test.jpg" alt="Test" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows progress label in pin mode", () => {
    const { container } = render(<ScrollClipImage src="/test.jpg" alt="Test" pin />);
    expect(container.textContent).toContain("/ 99");
  });

  it("hides progress label when showProgress is false", () => {
    const { container } = render(
      <ScrollClipImage src="/test.jpg" alt="Test" pin showProgress={false} />,
    );
    expect(container.textContent).not.toContain("/ 99");
  });

  it("renders copyright label when provided", () => {
    render(<ScrollClipImage src="/test.jpg" alt="Test" copyright="Studio XYZ" />);
    expect(screen.getByText(/Studio XYZ/)).toBeInTheDocument();
  });

  it("renders children slot", () => {
    render(
      <ScrollClipImage src="/test.jpg" alt="Test">
        <p>Caption text</p>
      </ScrollClipImage>,
    );
    expect(screen.getByText("Caption text")).toBeInTheDocument();
  });

  it("places credit below the image and forwards refs", () => {
    const objectRef = { current: null as HTMLDivElement | null };
    const fnRef = vi.fn();
    const { rerender } = render(
      <ScrollClipImage
        ref={objectRef}
        src="/test.jpg"
        alt="Test"
        copyright="Studio XYZ"
        copyrightSource="film"
        copyrightPosition="below"
        srcSet="/test.jpg 1x"
        sizes="100vw"
      />,
    );
    expect(objectRef.current).not.toBeNull();
    expect(screen.getByText(/Studio XYZ/)).toBeInTheDocument();

    rerender(
      <ScrollClipImage ref={fnRef} src="/test.jpg" alt="Test" pin>
        <p>Pinned caption</p>
      </ScrollClipImage>,
    );
    expect(fnRef).toHaveBeenCalled();
    expect(screen.getByText("Pinned caption")).toBeInTheDocument();
  });

  it("snaps the mask open when reduced motion is preferred", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    render(<ScrollClipImage src="/test.jpg" alt="Test" />);
    expect(screen.getByRole("img", { name: "Test" })).toBeInTheDocument();
  });
});
