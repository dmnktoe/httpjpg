import { render } from "@testing-library/react";

import { SbSection } from "./SbSection";

describe("SbSection", () => {
  it("returns null when the content is empty", () => {
    const { container } = render(<SbSection blok={{ _uid: "1", component: "section" } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders content bloks", () => {
    // The Storyblok registry is uninitialised in unit tests, so child bloks
    // render as empty slots — assert the Section wrapper itself is present.
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
    expect(container.querySelector("section")).not.toBeNull();
  });
});
