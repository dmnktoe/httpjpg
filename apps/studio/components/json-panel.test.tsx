import { fireEvent, render, screen } from "@testing-library/react";

import { JsonPanel } from "./json-panel";

const EXPORTED = {
  component: "grid" as const,
  _uid: "g1",
  columns: "12",
  items: [],
};

describe("JsonPanel", () => {
  it("toggles the pretty-printed grid JSON", () => {
    render(<JsonPanel exported={EXPORTED} />);

    expect(screen.queryByText(/"component": "grid"/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show JSON" }));
    expect(screen.getByText(/"component": "grid"/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hide JSON" }));
    expect(screen.queryByText(/"component": "grid"/)).toBeNull();
  });
});
