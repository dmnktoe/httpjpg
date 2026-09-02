import { render, screen } from "@testing-library/react";

import { BlokPreview } from "./blok-preview";
import { emptySpacing } from "./lib";

describe("BlokPreview", () => {
  it("renders the plugin preview when the type is known", () => {
    render(
      <BlokPreview
        item={{
          id: "a",
          type: "headline",
          x: 0,
          y: 0,
          w: 4,
          h: 2,
          spacing: emptySpacing(),
          data: { text: "Hello", level: "2" },
        }}
      />,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("falls back to the raw type when the plugin is missing", () => {
    render(
      <BlokPreview
        item={{
          id: "b",
          type: "ghost",
          x: 0,
          y: 0,
          w: 4,
          h: 2,
          spacing: emptySpacing(),
          data: {},
        }}
      />,
    );
    expect(screen.getByText("ghost")).toBeInTheDocument();
  });
});
