import { render } from "@testing-library/react";

import { WorkAccentSwatch } from "./work-accent-swatch";

describe("WorkAccentSwatch", () => {
  it("renders nothing without a parseable hex", () => {
    const { container } = render(<WorkAccentSwatch color="primary.500" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("paints an 8px chip with the normalised hex", () => {
    const { container } = render(<WorkAccentSwatch color="#ec6839" />);
    const swatch = container.querySelector("[data-work-accent-swatch]");
    expect(swatch).not.toBeNull();
    expect(swatch).toHaveStyle({ backgroundColor: "rgb(236, 104, 57)" });
  });
});
