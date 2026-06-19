import { render } from "@testing-library/react";

import { SbSection } from "./SbSection";

describe("SbSection", () => {
  it("returns null when the content is empty", () => {
    const { container } = render(<SbSection blok={{ _uid: "1", component: "section" } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders content bloks", () => {
    const { container } = render(
      <SbSection
        blok={
          {
            _uid: "1",
            component: "section",
            content: [{ _uid: "c1", component: "headline", text: "Hi" }],
          } as never
        }
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });
});
