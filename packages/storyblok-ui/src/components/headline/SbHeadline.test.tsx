import { render, screen } from "@testing-library/react";

import { SbHeadline } from "./SbHeadline";

describe("SbHeadline", () => {
  it("renders the headline text", () => {
    render(<SbHeadline blok={{ _uid: "1", component: "headline", text: "Hello" } as never} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders at the requested heading level", () => {
    render(
      <SbHeadline
        blok={{ _uid: "2", component: "headline", text: "Title", level: "1" } as never}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Title");
  });
});
