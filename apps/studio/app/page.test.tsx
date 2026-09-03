vi.mock("@/components/grid-builder", () => ({
  GridBuilder: ({ pushEnabled, siteUrl }: GridBuilderMockProps) => (
    <div data-testid="grid-builder" data-push={String(pushEnabled)} data-url={siteUrl} />
  ),
}));

import { env } from "@httpjpg/env";
import { render, screen } from "@testing-library/react";

import GridStudioPage from "./page";

interface GridBuilderMockProps {
  pushEnabled: boolean;
  siteUrl: string;
}

describe("GridStudioPage", () => {
  it("renders the builder with the public site url", () => {
    render(<GridStudioPage />);
    const builder = screen.getByTestId("grid-builder");
    expect(builder).toHaveAttribute(
      "data-push",
      String(Boolean(env.STORYBLOK_MANAGEMENT_TOKEN && env.STORYBLOK_SPACE_ID)),
    );
    expect(builder.getAttribute("data-url")).toBe(env.NEXT_PUBLIC_APP_URL ?? null);
  });
});
