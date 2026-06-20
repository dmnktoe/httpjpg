import { render, screen } from "@testing-library/react";

import { SbStats } from "./SbStats";

describe("SbStats", () => {
  it("returns null without items", () => {
    const { container } = render(<SbStats blok={{ _uid: "1", component: "stats" } as never} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders stat values and labels", () => {
    render(
      <SbStats
        blok={
          {
            _uid: "2",
            component: "stats",
            columns: "3",
            items: [{ _uid: "s1", value: "42", label: "Projects", caption: "shipped" }],
          } as never
        }
      />,
    );
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("ignores out-of-range column counts", () => {
    render(
      <SbStats
        blok={
          {
            _uid: "3",
            component: "stats",
            columns: "9",
            items: [{ _uid: "s1", value: "1", label: "One" }],
          } as never
        }
      />,
    );
    expect(screen.getByText("One")).toBeInTheDocument();
  });
});
