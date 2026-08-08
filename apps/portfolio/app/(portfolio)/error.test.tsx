vi.mock("@httpjpg/observability/sentry/client.ts", () => ({
  captureClientException: vi.fn(),
}));

import { captureClientException } from "@httpjpg/observability/sentry/client.ts";
import { fireEvent, render, screen } from "@testing-library/react";

import PortfolioError from "./error";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PortfolioError", () => {
  it("reports the error to Sentry with the boundary tag", () => {
    const error = Object.assign(new Error("boom"), { digest: "d1g3st" });

    render(<PortfolioError error={error} reset={vi.fn()} />);

    expect(captureClientException).toHaveBeenCalledWith(error, {
      tags: { errorBoundary: "portfolio", digest: "d1g3st" },
    });
  });

  it("renders the fallback copy and the home link", () => {
    render(<PortfolioError error={new Error("boom")} reset={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /Etwas ist schiefgelaufen/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Zurück zur Startseite/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("shows the error id when a digest is present", () => {
    render(
      <PortfolioError
        error={Object.assign(new Error("boom"), { digest: "abc" })}
        reset={vi.fn()}
      />,
    );

    expect(screen.getByText(/Error ID:/)).toHaveTextContent("abc");
  });

  it("omits the error id when there is no digest", () => {
    render(<PortfolioError error={new Error("boom")} reset={vi.fn()} />);

    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
  });

  it("calls reset when the retry button is pressed", () => {
    const reset = vi.fn();
    render(<PortfolioError error={new Error("boom")} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: /Erneut versuchen/i }));

    expect(reset).toHaveBeenCalledOnce();
  });
});
