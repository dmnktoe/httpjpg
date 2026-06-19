import { render, screen } from "@testing-library/react";

import { SbMissing } from "./SbMissing";

describe("SbMissing", () => {
  it("names the missing component in development", () => {
    render(<SbMissing blok={{ _uid: "1", component: "mystery_blok" }} />);
    expect(screen.getByText("mystery_blok")).toBeInTheDocument();
  });

  it("renders nothing in production", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const { container } = render(<SbMissing blok={{ _uid: "1", component: "mystery_blok" }} />);
    expect(container).toBeEmptyDOMElement();
    process.env.NODE_ENV = prev;
  });
});
