vi.mock("@/components/grid-builder", () => ({
  GridBuilder: ({ pushEnabled, siteUrl }: { pushEnabled: boolean; siteUrl: string }) => (
    <div data-testid="grid-builder" data-push={String(pushEnabled)} data-url={siteUrl} />
  ),
}));

import { render, screen } from "@testing-library/react";

import GridStudioPage from "./page";

describe("GridStudioPage", () => {
  it("renders the builder with the public site url", () => {
    render(<GridStudioPage />);
    expect(screen.getByTestId("grid-builder")).toBeInTheDocument();
  });
});
