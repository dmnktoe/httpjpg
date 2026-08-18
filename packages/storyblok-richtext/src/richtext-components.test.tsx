import { Headline, Paragraph } from "@httpjpg/ui";
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

type TextAlign = "left" | "center" | "right" | "justify";

function referenceParagraphClass(align?: TextAlign) {
  const { container } = render(
    <Paragraph spacing align={align}>
      aligned
    </Paragraph>,
  );
  return container.querySelector("p")?.className;
}

function referenceHeadlineClass(align?: TextAlign) {
  const { container } = render(
    <Headline level={2} marginTop="6" marginBottom="3" align={align}>
      aligned
    </Headline>,
  );
  return container.querySelector("h2")?.className;
}

function paragraphClassName(textAlign?: TextAlign) {
  const { container } = renderDoc([
    {
      type: "paragraph",
      ...(textAlign ? { attrs: { textAlign } } : {}),
      content: [text("aligned")],
    },
  ]);
  return container.querySelector("p")?.className;
}

function headingClassName(textAlign?: TextAlign) {
  const { container } = renderDoc([
    {
      type: "heading",
      attrs: { level: 2, ...(textAlign ? { textAlign } : {}) },
      content: [text("aligned")],
    },
  ]);
  return container.querySelector("h2")?.className;
}

describe("richTextComponents · text blocks", () => {
  it("renders a paragraph", () => {
    const { container } = renderDoc([{ type: "paragraph", content: [text("hello")] }]);
    expect(container.querySelector("p")).toHaveTextContent("hello");
  });

  it("applies paragraph text alignment from Storyblok attrs", () => {
    for (const align of ["center", "right", "justify"] as const) {
      expect(paragraphClassName(align)).toBe(referenceParagraphClass(align));
    }

    expect(paragraphClassName()).toBe(referenceParagraphClass("left"));
    expect(paragraphClassName("left")).toBe(referenceParagraphClass("left"));
  });

  it("ignores unknown paragraph text alignment values", () => {
    const { container: defaultContainer } = renderDoc([
      { type: "paragraph", content: [text("left")] },
    ]);
    const { container } = renderDoc([
      { type: "paragraph", attrs: { textAlign: "start" }, content: [text("invalid")] },
    ]);
    expect(container.querySelector("p")?.className).toBe(
      defaultContainer.querySelector("p")?.className,
    );
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

  it("applies heading text alignment from Storyblok attrs", () => {
    for (const align of ["center", "right", "justify"] as const) {
      expect(headingClassName(align)).toBe(referenceHeadlineClass(align));
    }

    expect(headingClassName()).toBe(referenceHeadlineClass(undefined));
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

  it("reads intrinsic size from a Storyblok asset URL so the slot is reserved", () => {
    renderDoc([
      {
        type: "image",
        attrs: {
          src: "https://a.storyblok.com/f/12345/1920x1080/abcdef/photo.jpg",
          alt: "sized",
        },
      },
    ]);
    const img = screen.getByAltText("sized");
    expect(img).toHaveAttribute("width", "1920");
    expect(img).toHaveAttribute("height", "1080");
  });

  it("leaves width and height off when the URL has no embedded size", () => {
    renderDoc([{ type: "image", attrs: { src: "/photo.jpg", alt: "plain" } }]);
    const img = screen.getByAltText("plain");
    expect(img).not.toHaveAttribute("width");
    expect(img).not.toHaveAttribute("height");
  });

  it("renders copyright below a richtext image without introducing a div", () => {
    const { container } = renderDoc([
      {
        type: "paragraph",
        content: [
          {
            type: "image",
            attrs: {
              src: "/photo.jpg",
              alt: "credited",
              copyright: "Studio",
            },
          },
        ],
      },
    ]);
    const paragraph = container.querySelector("p");
    expect(paragraph?.querySelector("div")).toBeNull();
    expect(screen.getByText("© Studio")).toBeInTheDocument();
  });

  it("reads copyright from meta_data when the top-level field is missing", () => {
    renderDoc([
      {
        type: "image",
        attrs: {
          src: "/photo.jpg",
          alt: "meta",
          meta_data: { copyright: "From meta" },
        },
      },
    ]);
    expect(screen.getByText("© From meta")).toBeInTheDocument();
  });

  it("renders the asset source below the copyright", () => {
    renderDoc([
      {
        type: "image",
        attrs: {
          src: "/photo.jpg",
          alt: "sourced",
          copyright: "Studio",
          source: "flickr.com/x",
        },
      },
    ]);
    expect(screen.getByText("© Studio")).toBeInTheDocument();
    expect(screen.getByText("flickr.com/x")).toBeInTheDocument();
  });
});
