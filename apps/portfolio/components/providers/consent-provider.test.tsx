vi.mock("@httpjpg/consent", () => ({
  CookieBanner: () => <div data-testid="cookie-banner" />,
}));

vi.mock("@/lib/storyblok", () => ({}));

import { render, screen } from "@testing-library/react";

import { ConsentProvider } from "./consent-provider";
import { StoryblokProvider } from "./storyblok-provider";

describe("ConsentProvider", () => {
  it("renders the cookie banner", () => {
    render(<ConsentProvider />);

    expect(screen.getByTestId("cookie-banner")).toBeInTheDocument();
  });
});

describe("StoryblokProvider", () => {
  it("passes its children straight through", () => {
    render(<>{StoryblokProvider({ children: <span data-testid="child">hi</span> })}</>);

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
