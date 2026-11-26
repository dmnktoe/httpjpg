import { render } from "@testing-library/react";

import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("shows the picture, silent beside the name it belongs to", () => {
    const { container } = render(<Avatar name="httpjpg" src="/me.jpg" />);
    const img = container.querySelector("img");

    expect(img).toHaveAttribute("src", "/me.jpg");
    expect(img).toHaveAttribute("alt", "");
  });

  it("falls back to the first letter of the name", () => {
    const { container } = render(<Avatar name=" httpjpg" />);

    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent(/^h$/);
  });

  it("falls back to a glyph without a name", () => {
    const { container } = render(<Avatar name="" />);

    expect(container).toHaveTextContent("▲");
  });

  it("draws the ring only on request", () => {
    const plain = render(<Avatar name="a" />);
    expect(plain.container.querySelector("[data-avatar-ring]")).toBeNull();

    const ringed = render(<Avatar name="a" size="lg" ring css={{ m: "2" }} />);
    expect(ringed.container.querySelector("[data-avatar-ring]")).not.toBeNull();
    expect(ringed.container.querySelector("[data-avatar]")?.className).toContain("jpg-m_2");
  });
});
