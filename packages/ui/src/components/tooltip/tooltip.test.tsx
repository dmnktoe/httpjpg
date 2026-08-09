import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { asciiFrame, Tooltip } from "./tooltip";

describe("asciiFrame", () => {
  it("sizes the border to the label", () => {
    expect(asciiFrame("hi")).toBe(["+----+", "| hi |", "+----+"].join("\n"));
  });

  it("keeps every line the same width", () => {
    const lines = asciiFrame("@dmnktoe").split("\n");
    const widths = new Set(lines.map((line) => line.length));
    expect(widths.size).toBe(1);
  });

  it("handles an empty label without collapsing the frame", () => {
    expect(asciiFrame("")).toBe(["+--+", "|  |", "+--+"].join("\n"));
  });
});

describe("Tooltip", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the trigger and keeps the bubble hidden at rest", () => {
    render(
      <Tooltip label="@dmnktoe">
        <button type="button">avatar</button>
      </Tooltip>,
    );

    expect(screen.getByRole("button", { name: "avatar" })).toBeInTheDocument();
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("aria-hidden", "true");
  });

  it("reveals the bubble on hover and hides it again on leave", () => {
    render(
      <Tooltip label="@dmnktoe">
        <span>avatar</span>
      </Tooltip>,
    );
    const trigger = screen.getByText("avatar").parentElement as HTMLElement;

    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole("tooltip")).toHaveAttribute("aria-hidden", "false");

    fireEvent.mouseLeave(trigger);
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("aria-hidden", "true");
  });

  it("reveals the bubble on keyboard focus", () => {
    render(
      <Tooltip label="@dmnktoe">
        <button type="button">avatar</button>
      </Tooltip>,
    );

    fireEvent.focus(screen.getByRole("button"));

    expect(screen.getByRole("tooltip")).toHaveAttribute("aria-hidden", "false");
  });

  it("wires aria-describedby only while the bubble is shown", () => {
    render(
      <Tooltip label="@dmnktoe">
        <button type="button">avatar</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button").parentElement as HTMLElement;

    expect(trigger).not.toHaveAttribute("aria-describedby");

    fireEvent.mouseEnter(trigger);

    expect(trigger.getAttribute("aria-describedby")).toBe(screen.getByRole("tooltip").id);
  });

  it("dismisses on Escape", () => {
    render(
      <Tooltip label="@dmnktoe">
        <button type="button">avatar</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button").parentElement as HTMLElement;

    fireEvent.mouseEnter(trigger);
    fireEvent.keyDown(trigger, { key: "Escape" });

    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("aria-hidden", "true");
  });

  it("never reveals the bubble when disabled", () => {
    render(
      <Tooltip label="@dmnktoe" disabled>
        <button type="button">avatar</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button").parentElement as HTMLElement;

    fireEvent.mouseEnter(trigger);

    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("aria-hidden", "true");
    expect(trigger).not.toHaveAttribute("aria-describedby");
  });

  it("points down above the trigger and up below it", () => {
    const { unmount } = render(
      <Tooltip label="hi">
        <span>a</span>
      </Tooltip>,
    );
    expect(screen.getByRole("tooltip", { hidden: true }).textContent).toContain("v");
    unmount();

    render(
      <Tooltip label="hi" placement="bottom">
        <span>a</span>
      </Tooltip>,
    );
    expect(screen.getByRole("tooltip", { hidden: true }).textContent).toContain("^");
  });
});
