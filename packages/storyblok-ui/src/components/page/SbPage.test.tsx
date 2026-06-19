import { render } from "@testing-library/react";

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
});
