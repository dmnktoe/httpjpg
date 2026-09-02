vi.mock("@httpjpg/ui/styles.css", () => ({}));
vi.mock("@httpjpg/tokens/dist/tokens.css", () => ({}));
vi.mock("./globals.css", () => ({}));

import { render, screen } from "@testing-library/react";

import StudioLayout from "./layout";

describe("StudioLayout", () => {
  it("wraps children in a German html document", () => {
    render(
      <StudioLayout>
        <p>studio</p>
      </StudioLayout>,
    );
    expect(screen.getByText("studio")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("lang", "de");
  });
});
