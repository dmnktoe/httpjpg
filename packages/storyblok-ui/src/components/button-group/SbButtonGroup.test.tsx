import { render, screen } from "@testing-library/react";

import { SbButtonGroup } from "./SbButtonGroup";

describe("SbButtonGroup", () => {
  it("returns null without buttons", () => {
    const { container } = render(
      <SbButtonGroup blok={{ _uid: "1", component: "button_group" } as never} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a group for the configured buttons", () => {
    render(
      <SbButtonGroup
        blok={
          {
            _uid: "2",
            component: "button_group",
            buttons: [
              { _uid: "b1", component: "button", text: "Get in touch" },
              { _uid: "b2", component: "button", text: "See the work" },
            ],
          } as never
        }
      />,
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
  });
});
