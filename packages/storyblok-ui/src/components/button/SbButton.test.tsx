import { render, screen } from "@testing-library/react";

import { SbButton } from "./SbButton";

describe("SbButton", () => {
  it("renders a button when there is no link", () => {
    render(<SbButton blok={{ _uid: "1", component: "button", text: "Click" } as never} />);
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });

  it("renders a link when the blok has a link", () => {
    render(
      <SbButton
        blok={
          {
            _uid: "2",
            component: "button",
            text: "Go",
            link: { linktype: "url", url: "https://x.dev" },
          } as never
        }
      />,
    );
    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toHaveAttribute("href", "https://x.dev");
  });
});
