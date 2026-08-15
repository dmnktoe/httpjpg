vi.mock("@httpjpg/consent", () => ({
  CookieBanner: () => <div data-testid="cookie-banner" />,
}));

vi.mock("@/lib/storyblok", () => ({}));

import { render, screen, waitFor } from "@testing-library/react";

import { ConsentProvider } from "./consent-provider";
import { StoryblokProvider } from "./storyblok-provider";

describe("ConsentProvider", () => {
  it("renders the cookie banner in a top-level window", async () => {
    render(<ConsentProvider />);

    expect(await screen.findByTestId("cookie-banner")).toBeInTheDocument();
  });

  it("stays hidden while embedded in an iframe", async () => {
    const top = {} as Window;
    vi.spyOn(window, "top", "get").mockReturnValue(top);

    render(<ConsentProvider />);

    await waitFor(() => {
      expect(screen.queryByTestId("cookie-banner")).not.toBeInTheDocument();
    });
  });
});

describe("StoryblokProvider", () => {
  it("passes its children straight through", () => {
    render(<>{StoryblokProvider({ children: <span data-testid="child">hi</span> })}</>);

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
