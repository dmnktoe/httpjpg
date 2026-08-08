import { render, screen } from "@testing-library/react";

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
});
