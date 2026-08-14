import { fireEvent, render, screen } from "@testing-library/react";

import { LightboxTrigger } from "./lightbox-trigger";

describe("LightboxTrigger", () => {
  it("is a button carrying a default label", () => {
    render(<LightboxTrigger />);

    expect(screen.getByRole("button", { name: "Open at full size" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("takes a label naming what it opens", () => {
    render(<LightboxTrigger label="Open the poster at full size" />);

    expect(
      screen.getByRole("button", { name: "Open the poster at full size" }),
    ).toBeInTheDocument();
  });

  it("reports a click", () => {
    const onClick = vi.fn();
    render(<LightboxTrigger onClick={onClick} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders nothing visible in the cover variant", () => {
    render(<LightboxTrigger />);

    expect(screen.getByRole("button")).toBeEmptyDOMElement();
  });

  it("shows an ASCII chip in the corner variant", () => {
    render(<LightboxTrigger variant="corner" />);

    expect(screen.getByRole("button")).toHaveTextContent("[ ⤢ ]");
  });

  it("lets the corner variant carry its own glyph", () => {
    render(<LightboxTrigger variant="corner">[ zoom ]</LightboxTrigger>);

    expect(screen.getByRole("button")).toHaveTextContent("[ zoom ]");
  });
});
