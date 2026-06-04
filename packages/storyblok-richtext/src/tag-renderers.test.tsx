import { render, screen } from "@testing-library/react";

import { tagRenderers } from "./tag-renderers";

function renderNode(node: React.ReactNode) {
  return render(<div data-testid="root">{node}</div>);
}

describe("tagRenderers · text blocks", () => {
  it("renders a paragraph", () => {
    const { container } = renderNode(tagRenderers.p("k", {}, "hello"));
    expect(container.querySelector("p")).toHaveTextContent("hello");
  });

  it("renders headings at the right level", () => {
    renderNode(
      <>
        {tagRenderers.h1("h1", {}, "One")}
        {tagRenderers.h2("h2", {}, "Two")}
        {tagRenderers.h3("h3", {}, "Three")}
      </>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "One" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Two" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Three" })).toBeInTheDocument();
  });

  it("renders ordered and unordered lists with items", () => {
    const { container } = renderNode(
      <>
        {tagRenderers.ul("ul", {}, tagRenderers.li("li", {}, "bullet"))}
        {tagRenderers.ol("ol", {}, tagRenderers.li("li2", {}, "number"))}
      </>,
    );
    expect(container.querySelector("ul")).toHaveTextContent("bullet");
    expect(container.querySelector("ol")).toHaveTextContent("number");
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });

  it("renders a blockquote", () => {
    const { container } = renderNode(tagRenderers.blockquote("bq", {}, "quoted"));
    expect(container.querySelector("blockquote")).toHaveTextContent("quoted");
  });

  it("renders a preformatted block", () => {
    const { container } = renderNode(tagRenderers.pre("pre", {}, "code body"));
    expect(container.querySelector("pre")).toHaveTextContent("code body");
  });

  it("renders a divider for hr", () => {
    const { getByTestId } = renderNode(tagRenderers.hr("hr", {}, null));
    expect(getByTestId("root").firstChild).not.toBeNull();
  });
});

describe("tagRenderers · links", () => {
  it("renders an anchor with the given href", () => {
    renderNode(tagRenderers.a("a", { href: "/about" }, "About"));
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });

  it("returns the children unwrapped when there is no href", () => {
    renderNode(tagRenderers.a("a", {}, "plain text"));
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByTestId("root")).toHaveTextContent("plain text");
  });

  it("adds rel=noopener noreferrer for target _blank", () => {
    renderNode(tagRenderers.a("a", { href: "https://example.com", target: "_blank" }, "ext"));
    expect(screen.getByRole("link", { name: "ext" })).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("tagRenderers · code", () => {
  it("renders inline code without the data-inline-code marker attribute", () => {
    const { container } = renderNode(
      tagRenderers.code("c", { "data-inline-code": "true" }, "inline"),
    );
    const code = container.querySelector("code");
    expect(code).toHaveTextContent("inline");
    expect(code).not.toHaveAttribute("data-inline-code");
  });

  it("forwards attributes for block code", () => {
    const { container } = renderNode(tagRenderers.code("c", { id: "snippet" }, "block"));
    const code = container.querySelector("code");
    expect(code).toHaveTextContent("block");
    expect(code).toHaveAttribute("id", "snippet");
  });
});

describe("tagRenderers · images", () => {
  it("renders an emoji image inline with the data-emoji attribute", () => {
    const { container } = renderNode(
      tagRenderers.img("img", { src: "/smile.png", alt: ":)", "data-emoji": "smile" }, null),
    );
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("data-emoji", "smile");
    expect(img).toHaveAttribute("src", "/smile.png");
    expect(img).toHaveAttribute("draggable", "false");
  });

  it("renders a regular image through the block Image component", () => {
    renderNode(tagRenderers.img("img", { src: "/photo.jpg", alt: "a photo" }, null));
    expect(screen.getByAltText("a photo")).toBeInTheDocument();
  });
});
