import { render, screen } from "@testing-library/react";

import { SbCaption } from "./SbCaption";

const richText = (text: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

describe("SbCaption", () => {
  it("returns null when there is no content", () => {
    const { container } = render(<SbCaption data={undefined as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("returns null when the content has no text", () => {
    const { container } = render(
      <SbCaption data={{ type: "doc", content: [{ type: "paragraph" }] } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the caption text", () => {
    render(<SbCaption data={richText("A photo caption") as never} />);
    expect(screen.getByText("A photo caption")).toBeInTheDocument();
  });
});
