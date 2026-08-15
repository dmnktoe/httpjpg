import { colors } from "@httpjpg/tokens";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { VeilTintSync } from "./veil-tint-sync";

describe("VeilTintSync", () => {
  afterEach(() => {
    cleanup();
    document.documentElement.style.removeProperty("--page-veil-rgb");
  });

  it("renders nothing", () => {
    const { container } = render(<VeilTintSync color={colors.accent[500]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("stamps RGB channels onto the html element", () => {
    render(<VeilTintSync color={colors.accent[500]} />);
    expect(document.documentElement.style.getPropertyValue("--page-veil-rgb")).toBe("132 204 22");
  });

  it("clears the variable when color is omitted or invalid", () => {
    const { rerender } = render(<VeilTintSync color={colors.accent[500]} />);
    rerender(<VeilTintSync color={null} />);
    expect(document.documentElement.style.getPropertyValue("--page-veil-rgb")).toBe("");

    rerender(<VeilTintSync color="#ff00ff" />);
    expect(document.documentElement.style.getPropertyValue("--page-veil-rgb")).toBe("");
  });
});
