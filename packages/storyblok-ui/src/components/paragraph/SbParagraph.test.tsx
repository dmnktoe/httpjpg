import { render, screen } from "@testing-library/react";

import { SbParagraph } from "./SbParagraph";

describe("SbParagraph", () => {
  it("renders the paragraph text", () => {
    render(
      <SbParagraph blok={{ _uid: "1", component: "paragraph", text: "Body copy" } as never} />,
    );
    expect(screen.getByText("Body copy")).toBeInTheDocument();
  });

  it("treats the base size as the default (no size prop)", () => {
    render(
      <SbParagraph
        blok={{ _uid: "2", component: "paragraph", text: "Base", size: "base" } as never}
      />,
    );
    expect(screen.getByText("Base")).toBeInTheDocument();
  });
});
