import { render, screen } from "@testing-library/react";

import { SbCodeBlock } from "./SbCodeBlock";

describe("SbCodeBlock", () => {
  it("returns null without code", () => {
    const { container } = render(
      <SbCodeBlock blok={{ _uid: "1", component: "code_block" } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the code content", () => {
    render(
      <SbCodeBlock
        blok={
          {
            _uid: "2",
            component: "code_block",
            code: "const x = 1;",
            language: "ts",
          } as never
        }
      />,
    );
    expect(screen.getByText(/const x = 1/)).toBeInTheDocument();
  });
});
