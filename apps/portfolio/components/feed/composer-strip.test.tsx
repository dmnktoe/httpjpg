import { fireEvent, render, screen } from "@testing-library/react";

import { type ComposerMedia, newMedia } from "@/lib/feed/compose/media";

import { ComposerStrip, type ComposerStripProps } from "./composer-strip";

const REORDER_TYPE = "application/x-httpjpg-media";

function media(key: string, patch: Partial<ComposerMedia> = {}): ComposerMedia {
  return {
    ...newMedia(new File(["x"], `${key}.jpg`, { type: "image/jpeg" }), key, `blob:${key}`),
    ...patch,
  };
}

function renderStrip(props: Partial<ComposerStripProps> = {}) {
  const handlers = {
    onSelect: vi.fn(),
    onMove: vi.fn(),
    onRemove: vi.fn(),
    onAddFiles: vi.fn(),
  };
  const view = render(
    <ComposerStrip
      media={[media("a", { alt: "harbour" }), media("b", { kind: "video" }), media("c")]}
      selectedKey="b"
      {...handlers}
      {...props}
    />,
  );
  return { ...view, ...handlers };
}

function transfer(data: Record<string, string>) {
  return {
    types: Object.keys(data),
    getData: (type: string) => data[type] ?? "",
    setData: vi.fn(),
    effectAllowed: "",
  };
}

describe("ComposerStrip", () => {
  it("shows each file and marks the selected one", () => {
    const { container } = renderStrip();

    expect(screen.getByRole("button", { name: "File 1: harbour" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "File 2" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelectorAll("video")).toHaveLength(1);
  });

  it("selects, moves and removes with its buttons", () => {
    const { onSelect, onMove, onRemove } = renderStrip();

    fireEvent.click(screen.getByRole("button", { name: "File 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Move file 2 earlier" }));
    fireEvent.click(screen.getByRole("button", { name: "Move file 2 later" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove file 1" }));

    expect(onSelect).toHaveBeenCalledWith("c");
    expect(onMove).toHaveBeenNthCalledWith(1, 1, 0);
    expect(onMove).toHaveBeenNthCalledWith(2, 1, 2);
    expect(onRemove).toHaveBeenCalledWith("a");
    expect(screen.getByRole("button", { name: "Move file 1 earlier" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move file 3 later" })).toBeDisabled();
  });

  it("reorders when one thumbnail is dropped on another", () => {
    const { onMove } = renderStrip();
    const items = screen.getAllByRole("listitem");
    const dragged = transfer({});

    fireEvent.dragStart(items[2] as HTMLElement, { dataTransfer: dragged });
    expect(dragged.setData).toHaveBeenCalledWith(REORDER_TYPE, "2");

    const dropped = transfer({ [REORDER_TYPE]: "2" });
    expect(fireEvent.dragOver(items[0] as HTMLElement, { dataTransfer: dropped })).toBe(false);
    fireEvent.drop(items[0] as HTMLElement, { dataTransfer: dropped });

    expect(onMove).toHaveBeenCalledWith(2, 0);
  });

  it("leaves a drop of files to whoever takes files", () => {
    const { onMove } = renderStrip();
    const item = screen.getAllByRole("listitem")[0] as HTMLElement;
    const files = transfer({ Files: "" });

    expect(fireEvent.dragOver(item, { dataTransfer: files })).toBe(true);
    fireEvent.drop(item, { dataTransfer: files });

    expect(onMove).not.toHaveBeenCalled();
  });

  it("adds the files picked through its button", () => {
    const { onAddFiles } = renderStrip();
    const input = screen.getByLabelText("Add pictures or videos") as HTMLInputElement;
    const click = vi.spyOn(input, "click");
    const picked = new File(["x"], "new.jpg", { type: "image/jpeg" });

    fireEvent.click(screen.getByRole("button", { name: "[ + ]" }));
    expect(click).toHaveBeenCalled();

    fireEvent.change(input, { target: { files: [picked] } });
    expect(onAddFiles).toHaveBeenCalledWith([picked]);
  });
});
