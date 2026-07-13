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

  it("drops links with an unsafe URI scheme but keeps their text", () => {
    renderDoc([
      {
        type: "paragraph",
        content: [text("click", [{ type: "link", attrs: { href: "javascript:alert(1)" } }])],
      },
    ]);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByTestId("root")).toHaveTextContent("click");
  });

  it("allows mailto links", () => {
    renderDoc([
      {
        type: "paragraph",
        content: [text("mail", [{ type: "link", attrs: { href: "mailto:hi@example.com" } }])],
      },
    ]);
    expect(screen.getByRole("link", { name: "mail" })).toHaveAttribute(
      "href",
      "mailto:hi@example.com",
    );
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

  it("renders a regular image as a responsive block img at natural ratio", () => {
    renderDoc([{ type: "image", attrs: { src: "/photo.jpg", alt: "a photo" } }]);
    const img = screen.getByAltText("a photo");
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveStyle({ display: "block", maxWidth: "100%", height: "auto" });
    expect(img).not.toHaveStyle({ objectFit: "cover" });
  });

  it("renders a shield badge inline at natural size", () => {
    renderDoc([
      {
        type: "image",
        attrs: { src: "https://img.shields.io/github/v/release/dmnktoe/blt", alt: "Version" },
      },
    ]);
    const img = screen.getByAltText("Version");
    expect(img).toHaveStyle({ display: "inline-block", height: "1.5em", width: "auto" });
  });

  it("treats any .svg source as an inline badge", () => {
    renderDoc([{ type: "image", attrs: { src: "https://example.com/logo.svg", alt: "logo" } }]);
    expect(screen.getByAltText("logo")).toHaveStyle({ display: "inline-block" });
  });

  it("lays consecutive badges out in a single row, dropping hard breaks", () => {
    const { container } = renderDoc([
      {
        type: "paragraph",
        content: [
          { type: "image", attrs: { src: "https://img.shields.io/badge/version", alt: "Version" } },
          { type: "hard_break" },
          {
            type: "image",
            attrs: { src: "https://img.shields.io/badge/downloads", alt: "Downloads" },
          },
          { type: "hard_break" },
          { type: "image", attrs: { src: "https://img.shields.io/badge/macos", alt: "macOS" } },
        ],
      },
    ]);
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(3);
    expect(container.querySelector("br")).toBeNull();
    // All three badges share one parent row → they sit side by side.
    expect(imgs[0].parentElement).toBe(imgs[1].parentElement);
    expect(imgs[1].parentElement).toBe(imgs[2].parentElement);
  });

  it("keeps a mixed image-and-text paragraph as a normal paragraph", () => {
    const { container } = renderDoc([
      {
        type: "paragraph",
        content: [
          { type: "text", text: "see " },
          { type: "image", attrs: { src: "https://img.shields.io/badge/v", alt: "v" } },
        ],
      },
    ]);
    expect(container.querySelector("p")).toHaveTextContent("see");
  });

  it("keeps images inside a paragraph as phrasing content (no div nested in p)", () => {
    const { container } = renderDoc([
      {
        type: "paragraph",
        content: [
          { type: "image", attrs: { src: "https://img.shields.io/badge/x", alt: "badge" } },
          { type: "image", attrs: { src: "/screenshot.png", alt: "shot" } },
        ],
      },
    ]);
    const paragraph = container.querySelector("p");
    expect(paragraph).not.toBeNull();
    expect(paragraph?.querySelector("div")).toBeNull();
    expect(paragraph?.querySelectorAll("img")).toHaveLength(2);
  });
});
