import { fireEvent, render, screen } from "@testing-library/react";

import { Inspector } from "./inspector";
import { type BuilderItem, emptySpacing } from "./lib";

function headline(overrides: Partial<BuilderItem> = {}): BuilderItem {
  return {
    id: "item-a",
    type: "headline",
    x: 0,
    y: 0,
    w: 4,
    h: 2,
    spacing: emptySpacing(),
    data: { text: "Hello", level: "2", align: "" },
    ...overrides,
  };
}

describe("Inspector", () => {
  it("prompts to select an item when nothing is selected", () => {
    render(<Inspector item={null} viewport="lg" onChange={vi.fn()} onDataChange={vi.fn()} />);
    expect(screen.getByText(/Select an item on the canvas/)).toBeInTheDocument();
  });

  it("edits position, span, visibility, alignment, spacing and content", () => {
    const onChange = vi.fn();
    const onDataChange = vi.fn();
    render(
      <Inspector
        item={headline()}
        viewport="base"
        onChange={onChange}
        onDataChange={onDataChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Col Start"), { target: { value: "3" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ x: 2 }));

    fireEvent.change(screen.getByLabelText("Row Start"), { target: { value: "4" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ y: 3 }));

    fireEvent.change(screen.getByLabelText("Col Span"), { target: { value: "full" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ w: 12 }));

    fireEvent.click(screen.getByLabelText("Hide on mobile"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hiddenBase: true }));

    fireEvent.change(screen.getByLabelText("Align Self"), { target: { value: "center" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ alignSelf: "center" }));

    fireEvent.change(screen.getByLabelText("Text"), { target: { value: "World" } });
    expect(onDataChange).toHaveBeenCalledWith("text", "World");
  });

  it("clears inherited md/lg overrides when the field is emptied", () => {
    const onChange = vi.fn();
    render(
      <Inspector
        item={headline({ xMd: 2, wMd: 6, spacing: { base: { mt: "2" }, md: { mt: "4" }, lg: {} } })}
        viewport="md"
        onChange={onChange}
        onDataChange={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Col Start"), { target: { value: "0" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ xMd: undefined }));

    fireEvent.change(screen.getByLabelText("Col Span"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ wMd: undefined }));

    fireEvent.change(screen.getAllByLabelText("Top")[0], { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        spacing: expect.objectContaining({ md: expect.not.objectContaining({ mt: "4" }) }),
      }),
    );
  });

  it("renders textarea, select, and asset fields for other blok types", () => {
    const onDataChange = vi.fn();
    const { rerender } = render(
      <Inspector
        item={{
          ...headline(),
          type: "paragraph",
          data: { text: "body", align: "left" },
        }}
        viewport="lg"
        onChange={vi.fn()}
        onDataChange={onDataChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Text"), { target: { value: "next" } });
    expect(onDataChange).toHaveBeenCalledWith("text", "next");

    rerender(
      <Inspector
        item={{
          ...headline(),
          type: "image",
          data: { imageUrl: "", alt: "" },
        }}
        viewport="lg"
        onChange={vi.fn()}
        onDataChange={onDataChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Browse" })).toBeInTheDocument();
  });

  it("edits lg overrides, row span, justify, padding and story fields", () => {
    const onChange = vi.fn();
    const onDataChange = vi.fn();
    const { rerender } = render(
      <Inspector
        item={headline({ xLg: 1, wLg: 6, hLg: 3, justifySelf: "end" })}
        viewport="lg"
        onChange={onChange}
        onDataChange={onDataChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Row Span"), { target: { value: "full" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hLg: 12 }));
    fireEvent.change(screen.getByLabelText("Justify Self"), { target: { value: "" } });
    fireEvent.change(screen.getAllByLabelText("Top")[1], { target: { value: "4" } });
    fireEvent.click(screen.getByLabelText("Hide on desktop"));

    rerender(
      <Inspector
        item={{
          ...headline(),
          type: "work_card",
          data: { workUuid: "" },
        }}
        viewport="md"
        onChange={onChange}
        onDataChange={onDataChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Browse" }));
    fireEvent.change(screen.getByLabelText("Work Story"), { target: { value: "uuid" } });
    expect(onDataChange).toHaveBeenCalledWith("workUuid", "uuid");
  });

  it("keeps required base spans", () => {
    const onChange = vi.fn();
    render(
      <Inspector item={headline()} viewport="base" onChange={onChange} onDataChange={vi.fn()} />,
    );
    fireEvent.change(screen.getByLabelText("Col Span"), { target: { value: "" } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Row Start"), { target: { value: "0" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ y: 0 }));
  });

  it("writes lg row start and hides on tablet", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Inspector
        item={headline({ yLg: 2, h: 2 })}
        viewport="lg"
        onChange={onChange}
        onDataChange={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Row Start"), { target: { value: "0" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ yLg: undefined }));
    fireEvent.change(screen.getByLabelText("Col Span"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Level"), { target: { value: "1" } });

    rerender(
      <Inspector
        item={headline({ hiddenMd: true })}
        viewport="md"
        onChange={onChange}
        onDataChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Hide on tablet"));
  });

  it("writes md position and span, including inherited spacing hints", () => {
    const onChange = vi.fn();
    render(
      <Inspector
        item={headline({
          xMd: 2,
          yMd: 1,
          wMd: 4,
          hMd: 2,
          spacing: { base: { mt: "4" }, md: {}, lg: {} },
        })}
        viewport="md"
        onChange={onChange}
        onDataChange={vi.fn()}
      />,
    );

    expect(screen.getByText("↑ 4")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Col Start"), { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ xMd: 4 }));
    fireEvent.change(screen.getByLabelText("Row Start"), { target: { value: "3" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ yMd: 2 }));
    fireEvent.change(screen.getByLabelText("Row Span"), { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hMd: 5 }));
    fireEvent.change(screen.getByLabelText("Row Span"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hMd: undefined }));
  });

  it("writes lg col start and a full md row span", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Inspector
        item={headline({ xLg: 0, yLg: 0, wLg: 4 })}
        viewport="lg"
        onChange={onChange}
        onDataChange={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Col Start"), { target: { value: "4" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ xLg: 3 }));
    fireEvent.change(screen.getByLabelText("Col Span"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ wLg: undefined }));

    rerender(
      <Inspector
        item={headline({ hMd: 12 })}
        viewport="md"
        onChange={onChange}
        onDataChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Row Span")).toHaveValue("full");
  });

  it("picks an asset from the media dialog", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          ok: true,
          assets: [{ id: 1, filename: "https://a.storyblok.com/f/1/pic.jpg", alt: "Pic" }],
          total: 1,
          perPage: 24,
        }),
      }),
    );
    const onDataChange = vi.fn();
    render(
      <Inspector
        item={{
          ...headline(),
          type: "image",
          data: { imageUrl: "", alt: "" },
        }}
        viewport="lg"
        onChange={vi.fn()}
        onDataChange={onDataChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Browse" }));
    fireEvent.click(await screen.findByRole("button", { name: /pic.jpg/i }));
    expect(onDataChange).toHaveBeenCalledWith("imageUrl", "https://a.storyblok.com/f/1/pic.jpg");
  });
});
