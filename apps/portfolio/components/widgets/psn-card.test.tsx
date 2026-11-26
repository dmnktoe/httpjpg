import { fireEvent, render, screen } from "@testing-library/react";

import { PSNCard } from "./psn-card";

describe("PSNCard", () => {
  it("renders nothing without a username", () => {
    const { container } = render(<PSNCard />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the psnprofiles card for the given username", () => {
    render(<PSNCard username="player1" />);

    const image = screen.getByAltText("PSN Profile: player1");
    expect(image).toHaveAttribute("src", "https://card.psnprofiles.com/1/player1.png");
    expect(image).toHaveAttribute("draggable", "false");
  });

  it("can be picked up and moved on a desktop", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { container } = render(<PSNCard username="player1" />);
    const card = container.querySelector("[data-psn-card]") as HTMLElement;

    fireEvent.pointerDown(card, { pointerId: 1, button: 0, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(card, { pointerId: 1, clientX: 140, clientY: 120 });
    fireEvent.pointerUp(card, { pointerId: 1, clientX: 140, clientY: 120 });

    expect(card.style.left).not.toBe("");
    expect(card.style.right).toBe("auto");
    vi.unstubAllGlobals();
  });
});
