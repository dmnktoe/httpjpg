import { render, screen } from "@testing-library/react";

import { SbPagePost } from "./SbPagePost";

function post(extra: Record<string, unknown> = {}) {
  return {
    _uid: "post-1",
    component: "post",
    caption: "harbour",
    images: [
      {
        _uid: "img-1",
        component: "post_image",
        image: { filename: "https://a.storyblok.com/f/1/800x800/abc/a.jpg", alt: "Harbour" },
      },
    ],
    ...extra,
  } as never;
}

describe("SbPagePost", () => {
  it("renders the post", () => {
    render(<SbPagePost blok={post()} />);

    expect(screen.getByAltText("Harbour")).toHaveAttribute(
      "sizes",
      "(min-width: 640px) 640px, 100vw",
    );
    expect(screen.getByText("harbour")).toBeInTheDocument();
  });

  it("offers the draft tools on draft content", () => {
    render(<SbPagePost blok={post({ _editable: '<!--#storyblok#{"space":"7","id":"9"}-->' })} />);

    expect(screen.getByRole("status", { name: /draft preview/i })).toBeInTheDocument();
  });
});
