import { fireEvent, render, screen } from "@testing-library/react";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders an accessible checkbox with its label", () => {
    render(<Checkbox checked={false} label="Analytics" />);
    expect(screen.getByRole("checkbox", { name: /analytics/i })).toBeInTheDocument();
  });

  it("reflects the checked state", () => {
    render(<Checkbox checked label="On" />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onCheckedChange with the next state", () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox checked={false} label="Toggle" onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("does not fire when disabled", () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox checked={false} disabled label="Locked" onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
    fireEvent.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
