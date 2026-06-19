import { render } from "@testing-library/react";

import { SbIcon } from "./SbIcon";

describe("SbIcon", () => {
  it("returns null without an icon name", () => {
    const { container } = render(<SbIcon blok={{ _uid: "1", component: "icon" } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders an accessible label when provided", () => {
    const { container } = render(
      <SbIcon
        blok={{ _uid: "2", component: "icon", name: "arrow-right", label: "Next" } as never}
      />,
    );
    expect(container.querySelector('[aria-label="Next"]')).not.toBeNull();
  });
});
