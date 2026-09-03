import { render, screen } from "@testing-library/react";

import { SbPage } from "./SbPage";

describe("SbPage", () => {
  it("renders a light page by default", () => {
    const { container } = render(<SbPage blok={{ _uid: "1", component: "page" } as never} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders dark page bloks", () => {
    const { container } = render(
      <SbPage
        blok={
          {
            _uid: "1",
            component: "page",
            isDark: true,
            body: [{ _uid: "c1", component: "headline", text: "Hi" }],
          } as never
        }
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the editor chrome when the draft _editable comment is present", () => {
    render(
      <SbPage
        blok={
          {
            _uid: "2",
            component: "page",
            _editable: '<!--#storyblok#{"space":"7","id":"9"}-->',
          } as never
        }
      />,
    );
    expect(
      document.body.querySelector(
        'a[href="https://app.storyblok.com/#/me/spaces/7/stories/0/0/9"]',
      ),
    ).not.toBeNull();
    expect(screen.getByRole("status", { name: /preview mode/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show 12-column overlay (G)" })).not.toBeNull();
    expect(screen.getByRole("link", { name: "Exit draft preview" })).toHaveAttribute(
      "href",
      "/api/exit-draft",
    );
  });
});
