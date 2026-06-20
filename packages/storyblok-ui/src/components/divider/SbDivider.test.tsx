import { render, screen } from "@testing-library/react";

import { SbDivider } from "./SbDivider";

describe("SbDivider", () => {
  it("renders a divider element", () => {
    const { container } = render(<SbDivider blok={{ _uid: "1", component: "divider" } as never} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders an optional label", () => {
    render(<SbDivider blok={{ _uid: "2", component: "divider", label: "Section" } as never} />);
    expect(screen.getByText("Section")).toBeInTheDocument();
  });
});
