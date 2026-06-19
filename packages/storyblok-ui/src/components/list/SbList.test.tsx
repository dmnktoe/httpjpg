import { render, screen } from "@testing-library/react";

import { SbList } from "./SbList";

describe("SbList", () => {
  it("returns null when there are no items", () => {
    const { container } = render(<SbList blok={{ _uid: "1", component: "list" } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders an unordered list by default", () => {
    render(
      <SbList
        blok={
          {
            _uid: "2",
            component: "list",
            items: [
              { _uid: "i1", text: "One" },
              { _uid: "i2", text: "Two" },
            ],
          } as never
        }
      />,
    );
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("renders an ordered list when ordered is set", () => {
    const { container } = render(
      <SbList
        blok={
          {
            _uid: "3",
            component: "list",
            ordered: true,
            items: [{ _uid: "i1", text: "First" }],
          } as never
        }
      />,
    );
    expect(container.querySelector("ol")).not.toBeNull();
  });
});
