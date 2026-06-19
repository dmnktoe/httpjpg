import { render, screen } from "@testing-library/react";

import { SbCallout } from "./SbCallout";

describe("SbCallout", () => {
  it("renders the callout body", () => {
    render(
      <SbCallout
        blok={{ _uid: "1", component: "callout", title: "Note", body: "Heads up" } as never}
      />,
    );
    expect(screen.getByText("Heads up")).toBeInTheDocument();
  });

  it("renders a CTA button when text and link are provided", () => {
    render(
      <SbCallout
        blok={
          {
            _uid: "2",
            component: "callout",
            body: "Body",
            ctaText: "Read",
            ctaLink: { linktype: "url", url: "https://x.dev" },
          } as never
        }
      />,
    );
    expect(screen.getByRole("link", { name: "Read" })).toHaveAttribute("href", "https://x.dev");
  });
});
