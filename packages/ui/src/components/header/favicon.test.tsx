import { fireEvent, render, screen } from "@testing-library/react";

import { Favicon } from "./favicon";

const EXTERNAL_HREF = "https://github.com/dmnktoe";

function spinners(container: HTMLElement): Element[] {
  return Array.from(container.querySelectorAll('span[aria-hidden="true"]')).filter((element) =>
    ["|", "/", "-", "\\"].includes(element.textContent ?? ""),
  );
}

function loadFavicon(image: HTMLImageElement, size = 16) {
  Object.defineProperty(image, "naturalWidth", { configurable: true, value: size });
  Object.defineProperty(image, "naturalHeight", { configurable: true, value: size });
  fireEvent.load(image);
}

describe("Favicon", () => {
  it("renders a 14x14 proxied image for an external href", () => {
    const { container } = render(<Favicon href={EXTERNAL_HREF} />);

    const image = container.querySelector('img[src^="/api/favicon"]');
    expect(image).toHaveAttribute(
      "src",
      "/api/favicon?url=https%3A%2F%2Fgithub.com%2Fdmnktoe&sz=16",
    );
    expect(image).toHaveAttribute("width", "14");
    expect(image).toHaveAttribute("height", "14");
  });

  it("renders nothing for an href without a resolvable favicon URL", () => {
    const { container } = render(<Favicon href="internal-piece" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("spins an ascii frame until the favicon resolves", () => {
    const { container } = render(<Favicon href={EXTERNAL_HREF} />);

    expect(spinners(container)).toHaveLength(1);

    loadFavicon(container.querySelector('img[src^="/api/favicon"]')!);

    expect(spinners(container)).toHaveLength(0);
    expect(container.querySelector('img[src^="/api/favicon"]')).toBeInTheDocument();
    expect(screen.queryByText("🔗")).not.toBeInTheDocument();
  });

  it("settles an image that finished before hydration", () => {
    const complete = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "complete");
    const naturalWidth = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "naturalWidth",
    );
    const naturalHeight = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "naturalHeight",
    );
    Object.defineProperty(HTMLImageElement.prototype, "complete", {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", {
      configurable: true,
      get: () => 16,
    });
    Object.defineProperty(HTMLImageElement.prototype, "naturalHeight", {
      configurable: true,
      get: () => 16,
    });

    try {
      const { container } = render(<Favicon href={EXTERNAL_HREF} />);

      expect(spinners(container)).toHaveLength(0);
      expect(container.querySelector('img[src^="/api/favicon"]')).toBeInTheDocument();
    } finally {
      Object.defineProperty(HTMLImageElement.prototype, "complete", complete!);
      Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", naturalWidth!);
      Object.defineProperty(HTMLImageElement.prototype, "naturalHeight", naturalHeight!);
    }
  });

  it("keeps the hidden image eager, since a lazy one in a display:none slot never loads", () => {
    const { container } = render(<Favicon href={EXTERNAL_HREF} />);

    expect(container.querySelector('img[src^="/api/favicon"]')).not.toHaveAttribute(
      "loading",
      "lazy",
    );
  });

  it("swaps the image for a link-glyph fallback when the favicon fails offline", () => {
    const { container } = render(<Favicon href={EXTERNAL_HREF} />);

    fireEvent.error(container.querySelector('img[src^="/api/favicon"]')!);

    expect(spinners(container)).toHaveLength(0);
    expect(container.querySelector('img[src^="/api/favicon"]')).toBeNull();
    expect(screen.getByText("🔗")).toBeInTheDocument();
  });

  it("treats the 1×1 miss placeholder as a failed favicon", () => {
    const { container } = render(<Favicon href={EXTERNAL_HREF} />);
    const image = container.querySelector('img[src^="/api/favicon"]')!;

    Object.defineProperty(image, "naturalWidth", { configurable: true, value: 1 });
    Object.defineProperty(image, "naturalHeight", { configurable: true, value: 1 });
    fireEvent.load(image);

    expect(container.querySelector('img[src^="/api/favicon"]')).toBeNull();
    expect(screen.getByText("🔗")).toBeInTheDocument();
  });
});
