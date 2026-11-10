import { fireEvent, render, screen } from "@testing-library/react";

import { BlokField } from "./inspector-blok-field";
import type { FieldDef } from "./lib";

vi.mock("./asset-picker", () => ({
  AssetPicker: ({
    open,
    onClose,
    onPick,
  }: {
    open: boolean;
    onClose(): void;
    onPick(asset: { filename: string }): void;
  }) =>
    open ? (
      <div>
        <button type="button" onClick={() => onPick({ filename: "https://cdn/x.png" })}>
          pick asset
        </button>
        <button type="button" onClick={onClose}>
          close asset
        </button>
      </div>
    ) : null,
  StoryPicker: ({
    open,
    startsWith,
    onClose,
    onPick,
  }: {
    open: boolean;
    startsWith?: string;
    onClose(): void;
    onPick(story: { uuid: string }): void;
  }) =>
    open ? (
      <div data-starts-with={startsWith}>
        <button type="button" onClick={() => onPick({ uuid: "story-uuid" })}>
          pick story
        </button>
        <button type="button" onClick={onClose}>
          close story
        </button>
      </div>
    ) : null,
}));

function field(overrides: Partial<FieldDef>): FieldDef {
  return { key: "k", label: "Label", type: "text", ...overrides };
}

describe("BlokField", () => {
  it("edits a text field by default", () => {
    const onChange = vi.fn();
    render(<BlokField field={field({ type: "text" })} value="a" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Label"), { target: { value: "b" } });
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("edits a textarea", () => {
    const onChange = vi.fn();
    render(<BlokField field={field({ type: "textarea" })} value={undefined} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Label"), { target: { value: "long" } });
    expect(onChange).toHaveBeenCalledWith("long");
  });

  it("edits a number as a number", () => {
    const onChange = vi.fn();
    render(<BlokField field={field({ type: "number" })} value={2} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Label"), { target: { value: "7" } });
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it("toggles a boolean", () => {
    const onChange = vi.fn();
    render(<BlokField field={field({ type: "boolean" })} value={false} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Label"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("renders a select with its options", () => {
    const onChange = vi.fn();
    render(
      <BlokField
        field={field({ type: "select", options: [{ value: "a", label: "A" }] })}
        value="a"
        onChange={onChange}
      />,
    );
    expect(screen.getByLabelText("Label")).toBeInTheDocument();
  });

  it("renders a select without options", () => {
    render(<BlokField field={field({ type: "select" })} value={undefined} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Label")).toBeInTheDocument();
  });

  it("types into and browses an asset field", () => {
    const onChange = vi.fn();
    render(<BlokField field={field({ type: "assetUrl" })} value="" onChange={onChange} />);
    expect(screen.getByPlaceholderText("https://...")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Label"), { target: { value: "https://a" } });
    expect(onChange).toHaveBeenCalledWith("https://a");

    fireEvent.click(screen.getByText("Browse"));
    fireEvent.click(screen.getByText("pick asset"));
    expect(onChange).toHaveBeenCalledWith("https://cdn/x.png");
    expect(screen.queryByText("pick asset")).not.toBeInTheDocument();
  });

  it("closes the asset picker without picking", () => {
    const onChange = vi.fn();
    render(<BlokField field={field({ type: "assetUrl" })} value="" onChange={onChange} />);
    fireEvent.click(screen.getByText("Browse"));
    fireEvent.click(screen.getByText("close asset"));
    expect(screen.queryByText("close asset")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("browses a story field with its path filter", () => {
    const onChange = vi.fn();
    render(
      <BlokField
        field={field({ type: "storyUuid", storyStartsWith: "work/" })}
        value=""
        onChange={onChange}
      />,
    );
    expect(screen.getByPlaceholderText("uuid")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Browse"));
    expect(screen.getByText("pick story").parentElement).toHaveAttribute(
      "data-starts-with",
      "work/",
    );
    fireEvent.click(screen.getByText("pick story"));
    expect(onChange).toHaveBeenCalledWith("story-uuid");
  });

  it("closes the story picker without picking", () => {
    render(<BlokField field={field({ type: "storyUuid" })} value="" onChange={vi.fn()} />);
    fireEvent.click(screen.getByText("Browse"));
    fireEvent.click(screen.getByText("close story"));
    expect(screen.queryByText("close story")).not.toBeInTheDocument();
  });
});
