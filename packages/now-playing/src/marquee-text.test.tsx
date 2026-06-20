import { render, screen } from "@testing-library/react";

import { MarqueeText } from "./marquee-text";

describe("MarqueeText", () => {
  it("renders its text content while measuring", () => {
    render(<MarqueeText>Song title</MarqueeText>);
    expect(screen.getByText("Song title")).toBeInTheDocument();
  });

  it("accepts a custom speed without throwing", () => {
    render(<MarqueeText speed={25}>Artist name</MarqueeText>);
    expect(screen.getByText("Artist name")).toBeInTheDocument();
  });
});
