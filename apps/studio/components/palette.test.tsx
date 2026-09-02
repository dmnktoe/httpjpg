import { fireEvent, render, screen } from "@testing-library/react";

import { Palette } from "./palette";

describe("Palette", () => {
  it("groups blocks and starts a drag with the blok type", () => {
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
    render(<Palette onDragStart={onDragStart} onDragEnd={onDragEnd} />);

    expect(screen.getByRole("heading", { name: "Blocks" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Content" })).toBeInTheDocument();

    const headline = screen.getByRole("button", { name: "Headline" });
    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: "",
    };
    fireEvent.dragStart(headline, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith("application/x-blok-type", "headline");
    expect(onDragStart).toHaveBeenCalledWith(expect.objectContaining({ type: "headline" }));

    fireEvent.dragEnd(headline);
    expect(onDragEnd).toHaveBeenCalled();
  });
});
