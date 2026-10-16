import { render, screen } from "@testing-library/react";

import { EntranceMotion } from "./entrance-motion";

describe("EntranceMotion", () => {
  it.each([undefined, "", "none", "spin"])("renders children unwrapped for %j", (animation) => {
    const { container } = render(
      <EntranceMotion blok={{ animation }}>
        <span>plain</span>
      </EntranceMotion>,
    );
    expect(container.innerHTML).toBe("<span>plain</span>");
  });

  it("wraps children for a CMS animation", () => {
    const { container } = render(
      <EntranceMotion blok={{ animation: "fadeIn", animationDelay: "0.2" }}>
        <span>moving</span>
      </EntranceMotion>,
    );
    expect(screen.getByText("moving").parentElement).toBe(container.firstElementChild);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });
});
