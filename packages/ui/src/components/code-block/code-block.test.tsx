import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CodeBlock } from "./code-block";

const SAMPLE_CODE = "const x = 1;\nconst y = 2;";

describe("CodeBlock", () => {
  it("renders code content", () => {
    render(<CodeBlock code={SAMPLE_CODE} />);
    expect(screen.getByText(/const x = 1/)).toBeInTheDocument();
  });

  it("renders filename in header", () => {
    render(<CodeBlock code={SAMPLE_CODE} filename="index.ts" />);
    expect(screen.getByText("index.ts")).toBeInTheDocument();
  });

  it("renders language when no filename", () => {
    render(<CodeBlock code={SAMPLE_CODE} language="typescript" />);
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("shows language suffix when both filename and language set", () => {
    render(<CodeBlock code={SAMPLE_CODE} filename="index.ts" language="tsx" />);
    expect(screen.getByText("index.ts")).toBeInTheDocument();
    expect(screen.getByText(/tsx/)).toBeInTheDocument();
  });

  it("renders line numbers when enabled", () => {
    render(<CodeBlock code={SAMPLE_CODE} showLineNumbers />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders copy button by default", () => {
    render(<CodeBlock code={SAMPLE_CODE} />);
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
  });

  it("hides copy button when copyable is false", () => {
    render(<CodeBlock code={SAMPLE_CODE} copyable={false} />);
    expect(screen.queryByRole("button", { name: "Copy code" })).not.toBeInTheDocument();
  });

  it("copies code to clipboard on click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<CodeBlock code="hello" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("hello");
    });
  });
});
