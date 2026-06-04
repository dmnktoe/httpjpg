import { render, screen } from "@testing-library/react";

import { type ISbRichtext, renderStoryblokRichText, StoryblokRichText } from "./richtext";

const paragraphDoc = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hello world" }] }],
} as unknown as ISbRichtext;

const headingDoc = {
  type: "doc",
  content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "A Title" }] }],
} as unknown as ISbRichtext;

describe("renderStoryblokRichText", () => {
  it("returns null for nullish data", () => {
    expect(renderStoryblokRichText(null)).toBeNull();
    expect(renderStoryblokRichText(undefined)).toBeNull();
  });

  it("renders a document to React nodes", () => {
    render(<div data-testid="root">{renderStoryblokRichText(paragraphDoc)}</div>);
    expect(screen.getByTestId("root")).toHaveTextContent("Hello world");
  });
});

describe("StoryblokRichText", () => {
  it("renders nothing without data", () => {
    const { container } = render(<StoryblokRichText data={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders paragraph content through the tag renderers", () => {
    const { container } = render(<StoryblokRichText data={paragraphDoc} />);
    expect(container.querySelector("p")).toHaveTextContent("Hello world");
  });

  it("renders heading content at the resolved level", () => {
    render(<StoryblokRichText data={headingDoc} />);
    expect(screen.getByRole("heading", { level: 2, name: "A Title" })).toBeInTheDocument();
  });

  it("applies the color prop as an inline style", () => {
    const { container } = render(<StoryblokRichText data={paragraphDoc} color="rgb(255, 0, 0)" />);
    expect(container.firstChild).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });
});
