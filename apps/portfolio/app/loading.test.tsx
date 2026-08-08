import { render } from "@testing-library/react";

import PortfolioLayout from "./(portfolio)/layout";
import PortfolioLoading from "./(portfolio)/loading";
import RootLoading from "./loading";

describe("loading states", () => {
  it("renders the root loading indicator", () => {
    const { container } = render(<RootLoading />);

    expect(container.firstChild).not.toBeNull();
  });

  it("renders the portfolio loading indicator", () => {
    const { container } = render(<PortfolioLoading />);

    expect(container.firstChild).not.toBeNull();
  });
});

describe("PortfolioLayout", () => {
  it("passes its children straight through without a wrapper", () => {
    const { container } = render(
      <>{PortfolioLayout({ children: <span data-testid="child">hi</span> })}</>,
    );

    expect(container.innerHTML).toBe('<span data-testid="child">hi</span>');
  });
});
