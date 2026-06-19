import { render } from "@testing-library/react";

import { SbContainer } from "./SbContainer";

describe("SbContainer", () => {
  it("returns null when the body is empty", () => {
    const { container } = render(
      <SbContainer blok={{ _uid: "1", component: "container" } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders child bloks when a body is provided", () => {
    const { container } = render(
      <SbContainer
        blok={
          {
            _uid: "1",
            component: "container",
            body: [{ _uid: "c1", component: "headline", text: "Hi" }],
          } as never
        }
      />,
    );
    expect(container.querySelector("div")).not.toBeNull();
  });
});
