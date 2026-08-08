vi.mock("@httpjpg/observability/sentry/client.ts", () => ({
  captureClientException: vi.fn(),
}));

import { captureClientException } from "@httpjpg/observability/sentry/client.ts";
import { fireEvent, render, screen } from "@testing-library/react";

import Error500 from "./error";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("[...slug] error boundary", () => {
  it("logs the error and reports it to Sentry", () => {
    const error = Object.assign(new Error("boom"), { digest: "xyz" });

    render(<Error500 error={error} reset={vi.fn()} />);

    expect(console.error).toHaveBeenCalledWith("[Portfolio] Render error:", error);
    expect(captureClientException).toHaveBeenCalledWith(error, {
      tags: { errorBoundary: "portfolio-slug", digest: "xyz" },
    });
  });

  it("renders the 500 headline and the back link", () => {
    render(<Error500 error={new Error("boom")} reset={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "500" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to/i })).toHaveAttribute("href", "/");
  });

  it("shows the digest when present", () => {
    render(
      <Error500 error={Object.assign(new Error("boom"), { digest: "xyz" })} reset={vi.fn()} />,
    );

    expect(screen.getByText(/digest:/)).toHaveTextContent("xyz");
  });

  it("omits the digest when absent", () => {
    render(<Error500 error={new Error("boom")} reset={vi.fn()} />);

    expect(screen.queryByText(/digest:/)).not.toBeInTheDocument();
  });

  it("calls reset when retry is pressed", () => {
    const reset = vi.fn();
    render(<Error500 error={new Error("boom")} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    expect(reset).toHaveBeenCalledOnce();
  });
});
