import { render } from "@testing-library/react";

import { Icon, type IconName } from "./icon";

const NAMES: IconName[] = [
  "arrow-up",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "close",
  "play",
  "pause",
  "volume",
  "volume-mute",
];

describe("Icon", () => {
  it.each(NAMES)("renders the %s glyph as a hidden image", (name) => {
    const { container } = render(<Icon name={name} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute(
      "viewBox",
      name === "play" || name === "pause" || name === "volume" || name === "volume-mute"
        ? "0 0 24 24"
        : "0 0 32 32",
    );
  });

  it("accepts a numeric size and forwards a ref", () => {
    const ref = { current: null as SVGSVGElement | null };
    const { container } = render(<Icon ref={ref} name="close" size={16} />);
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
    expect(container.querySelector("svg")).toHaveStyle({ width: "16px", height: "16px" });
  });
});
