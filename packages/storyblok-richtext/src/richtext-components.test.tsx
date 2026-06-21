import { render, screen } from "@testing-library/react";

import { type ISbRichtext, renderStoryblokRichText } from "./richtext";

function doc(content: unknown[]): ISbRichtext {
  return { type: "doc", content } as unknown as ISbRichtext;
}

function renderDoc(content: unknown[]) {
  return render(<div data-testid="root">{renderStoryblokRichText(doc(content))}</div>);
}

function text(value: string, marks?: unknown[]) {
  return { type: "text", text: value, ...(marks ? { marks } : {}) };
}

describe("richTextComponents · text blocks", () => {
  it("renders a paragraph", () => {
    const { container } = renderDoc([{ type: "paragraph", content: [text("hello")] }]);
    expect(container.querySelector("p")).toHaveTextContent("hello");
  });

  it("renders headings at the right level", () => {
    renderDoc([
      { type: "heading", attrs: { level: 1 }, content: [text("One")] },
      { type: "heading", attrs: { level: 2 }, content: [text("Two")] },
      { type: "heading", attrs: { level: 3 }, content: [text("Three")] },
    ]);
    expect(screen.getByRole("heading", { level: 1, name: "One" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Two" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Three" })).toBeInTheDocument();
  });

  it("keeps the semantic tag for headings deeper than level 3", () => {
    renderDoc([{ type: "heading", attrs: { level: 4 }, content: [text("Four")] }]);
    expect(screen.getByRole("heading", { level: 4, name: "Four" })).toBeInTheDocument();
  });

  it("renders ordered and unordered lists with items", () => {
    const listItem = (value: string) => ({
      type: "list_item",
      content: [{ type: "paragraph", content: [text(value)] }],
    });
    const { container } = renderDoc([
      { type: "bullet_list", content: [listItem("bullet")] },
      { type: "ordered_list", content: [listItem("number")] },
    ]);
    expect(container.querySelector("ul")).toHaveTextContent("bullet");
    expect(container.querySelector("ol")).toHaveTextContent("number");
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });

  it("renders a blockquote", () => {
    const { container } = renderDoc([
      { type: "blockquote", content: [{ type: "paragraph", content: [text("quoted")] }] },
    ]);
    expect(container.querySelector("blockquote")).toHaveTextContent("quoted");
  });

  it("renders a code block as a preformatted block", () => {
    const { container } = renderDoc([{ type: "code_block", content: [text("code body")] }]);
    expect(container.querySelector("pre")).toHaveTextContent("code body");
  });

  it("renders a divider for a horizontal rule", () => {
    const { getByTestId } = renderDoc([{ type: "horizontal_rule" }]);
    expect(getByTestId("root").firstChild).not.toBeNull();
  });
});

describe("richTextComponents · links", () => {
  it("renders an anchor with the given href", () => {
    renderDoc([
      {
        type: "paragraph",
        content: [text("About", [{ type: "link", attrs: { href: "/about" } }])],
      },
    ]);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });

  it("adds rel=noopener noreferrer for target _blank", () => {
    renderDoc([
      {
        type: "paragraph",
        content: [
          text("ext", [{ type: "link", attrs: { href: "https://example.com", target: "_blank" } }]),
        ],
      },
    ]);
    expect(screen.getByRole("link", { name: "ext" })).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("richTextComponents · code", () => {
  it("styles inline code without leaking marker attributes", () => {
    const { container } = renderDoc([
      { type: "paragraph", content: [text("inline", [{ type: "code" }])] },
    ]);
    const code = container.querySelector("code");
    expect(code).toHaveTextContent("inline");
    expect(code).not.toHaveAttribute("data-inline-code");
  });
});

describe("richTextComponents · images", () => {
  it("renders an emoji inline with the data-emoji attribute", () => {
    const { container } = renderDoc([
      {
        type: "paragraph",
        content: [
          { type: "emoji", attrs: { name: "smile", emoji: ":)", fallbackImage: "/smile.png" } },
        ],
      },
    ]);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("data-emoji", "smile");
    expect(img).toHaveAttribute("src", "/smile.png");
    expect(img).toHaveAttribute("draggable", "false");
  });

  it("renders a regular image through the block Image component", () => {
    renderDoc([{ type: "image", attrs: { src: "/photo.jpg", alt: "a photo" } }]);
    expect(screen.getByAltText("a photo")).toBeInTheDocument();
  });
});
