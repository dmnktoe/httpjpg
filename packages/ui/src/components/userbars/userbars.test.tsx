import { render, screen } from "@testing-library/react";

import { USERBAR_HEIGHT, USERBAR_WIDTH, Userbars } from "./userbars";

const ITEMS = [
  { src: "https://cdn.example/wav.png", alt: ".WAV AUDIO FORMAT USER" },
  {
    src: "https://cdn.example/mac.png",
    alt: "Mac user",
    href: "https://example.com/mac",
  },
];

describe("Userbars", () => {
  it("renders nothing without items", () => {
    const { container } = render(<Userbars items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one image per item at the classic userbar size", () => {
    render(<Userbars items={ITEMS} />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", ITEMS[0].src);
    expect(images[0]).toHaveAttribute("alt", ITEMS[0].alt);
    expect(images[0]).toHaveAttribute("width", String(USERBAR_WIDTH));
    expect(images[0]).toHaveAttribute("height", String(USERBAR_HEIGHT));
  });

  it("paints the pixel art without smoothing", () => {
    render(<Userbars items={ITEMS} />);

    expect(screen.getByAltText(ITEMS[0].alt)).toHaveStyle({ imageRendering: "pixelated" });
  });

  it("links the items that carry an href", () => {
    render(<Userbars items={ITEMS} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", ITEMS[1].href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toContainElement(screen.getByAltText(ITEMS[1].alt));
  });

  it("wraps an internal href without opening a new tab", () => {
    render(<Userbars items={[{ src: ITEMS[0].src, alt: ITEMS[0].alt, href: "/about" }]} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/about");
    expect(link).not.toHaveAttribute("target");
  });

  it("drops an href with an unsafe URI scheme but still renders the bar", () => {
    render(
      <Userbars items={[{ src: ITEMS[0].src, alt: ITEMS[0].alt, href: "javascript:alert(1)" }]} />,
    );

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByAltText(ITEMS[0].alt)).toBeInTheDocument();
  });
});
