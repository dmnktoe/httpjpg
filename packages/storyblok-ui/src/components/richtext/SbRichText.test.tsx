import { render, screen } from "@testing-library/react";

import { SbRichText } from "./SbRichText";

const doc = (text: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

describe("SbRichText", () => {
  it("returns null without content", () => {
    const { container } = render(
      <SbRichText blok={{ _uid: "1", component: "richtext" } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the rich text content", () => {
    render(
      <SbRichText
        blok={{ _uid: "2", component: "richtext", content: doc("Rich body") } as never}
      />,
    );
    expect(screen.getByText("Rich body")).toBeInTheDocument();
  });

  it("disables maxWidth when set to none", () => {
    render(
      <SbRichText
        blok={{ _uid: "3", component: "richtext", content: doc("Wide"), maxWidth: "none" } as never}
      />,
    );
    expect(screen.getByText("Wide")).toBeInTheDocument();
  });
});
