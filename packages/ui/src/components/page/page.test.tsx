import { render, screen } from "@testing-library/react";
import { createRef } from "react";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { Page } from "./page";

describe("Page", () => {
  it("renders its children inside the main landmark", () => {
    render(
      <Page>
        <p>content</p>
      </Page>,
    );

    expect(screen.getByRole("main")).toHaveTextContent("content");
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Page ref={ref}>content</Page>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders no header or footer by default and leaves no footer gap", () => {
    render(<Page>content</Page>);

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("pb_0");
  });

  it("renders a header when one is configured", () => {
    render(<Page header={{ nav: [{ name: "work", href: "/work" }] }}>content</Page>);

    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders a footer and reserves room for it", () => {
    render(<Page footer={{}}>content</Page>);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveClass("pb_100px");
  });
});
