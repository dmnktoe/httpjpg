import { render, screen } from "@testing-library/react";

import { SbImageComparison } from "./SbImageComparison";

const before = "https://a.storyblok.com/f/1/before.jpg";
const after = "https://a.storyblok.com/f/1/after.jpg";

describe("SbImageComparison", () => {
  it("returns null without both image filenames", () => {
    const { container } = render(
      <SbImageComparison
        blok={{ _uid: "1", component: "image_comparison", before: { filename: before } } as never}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the comparison slider from both assets", () => {
    render(
      <SbImageComparison
        blok={
          {
            _uid: "2",
            component: "image_comparison",
            before: { filename: before, alt: "Draft" },
            after: { filename: after, alt: "Final" },
            beforeLabel: "DRAFT",
            afterLabel: "FINAL",
          } as never
        }
      />,
    );

    expect(screen.getByAltText("Draft")).toBeInTheDocument();
    expect(screen.getByAltText("Final")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Compare DRAFT and FINAL" })).toBeInTheDocument();
  });

  it("falls back to asset titles, skips a non-numeric position, and renders a caption", () => {
    render(
      <SbImageComparison
        blok={
          {
            _uid: "3",
            component: "image_comparison",
            before: { filename: before, title: "Start" },
            after: { filename: after, title: "End" },
            orientation: "vertical",
            initialPosition: "nope",
            showLabels: false,
            showPosition: false,
            caption: {
              type: "doc",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Then and now" }] }],
            },
          } as never
        }
      />,
    );

    expect(screen.getByAltText("Start")).toBeInTheDocument();
    expect(screen.getByAltText("End")).toBeInTheDocument();
    expect(screen.getByText("Then and now")).toBeInTheDocument();
    expect(screen.queryByText("[ BEFORE ]")).not.toBeInTheDocument();
  });

  it("returns null without an after filename", () => {
    const { container } = render(
      <SbImageComparison
        blok={{ _uid: "4", component: "image_comparison", after: { filename: after } } as never}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
