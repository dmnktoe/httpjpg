import { act, fireEvent, render, screen, within } from "@testing-library/react";

import { useLightboxEntry, useLightboxGallery, type LightboxEntry } from "./lightbox-context";
import { LightboxProvider } from "./lightbox-provider";
import { LightboxTrigger } from "./lightbox-trigger";

const FIRST: LightboxEntry = {
  id: "one",
  src: "/one.jpg",
  alt: "One",
  copyright: "2025 Studio",
  copyrightSource: "id-100.online",
};
const SECOND: LightboxEntry = { id: "two", src: "/two.jpg", alt: "Two" };
const THIRD: LightboxEntry = { id: "three", src: "/three.jpg", alt: "Three" };

function Thumb({ item }: { item: LightboxEntry }) {
  const gallery = useLightboxGallery();
  useLightboxEntry(item);

  return (
    <div style={{ position: "relative" }}>
      <img src={item.src} alt={item.alt} />
      <LightboxTrigger
        label={`Open ${item.alt} at full size`}
        onClick={() => gallery?.openAt(item.id)}
      />
    </div>
  );
}

function renderGallery(items: LightboxEntry[] = [FIRST, SECOND, THIRD]) {
  return render(
    <LightboxProvider>
      {items.map((item) => (
        <Thumb key={item.id} item={item} />
      ))}
    </LightboxProvider>,
  );
}

describe("LightboxProvider", () => {
  it("starts closed", () => {
    renderGallery();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the clicked item and walks the page queue", () => {
    renderGallery();

    fireEvent.click(screen.getByRole("button", { name: "Open One at full size" }));

    const dialog = screen.getByRole("dialog", { name: "Image viewer" });
    expect(within(dialog).getByRole("img", { name: "One" })).toBeInTheDocument();
    expect(within(dialog).getByText("[ 01 / 03 ]")).toBeInTheDocument();
    expect(within(dialog).getByText("© 2025 Studio")).toBeInTheDocument();
    expect(within(dialog).getByText("id-100.online")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next image" }));

    expect(within(dialog).getByRole("img", { name: "Two" })).toBeInTheDocument();
    expect(within(dialog).getByText("[ 02 / 03 ]")).toBeInTheDocument();
  });

  it("opens a later item at its index, not at zero", () => {
    renderGallery();

    fireEvent.click(screen.getByRole("button", { name: "Open Two at full size" }));

    const dialog = screen.getByRole("dialog", { name: "Image viewer" });
    expect(within(dialog).getByRole("img", { name: "Two" })).toBeInTheDocument();
    expect(within(dialog).getByText("[ 02 / 03 ]")).toBeInTheDocument();
  });

  it("drops the navigation for a lone registered item", () => {
    renderGallery([FIRST]);

    fireEvent.click(screen.getByRole("button", { name: "Open One at full size" }));

    expect(screen.queryByRole("button", { name: "Next image" })).not.toBeInTheDocument();
    expect(screen.getByText("[ 01 ]")).toBeInTheDocument();
  });

  it("closes when the last registered item unmounts", async () => {
    const { rerender } = renderGallery([FIRST]);

    fireEvent.click(screen.getByRole("button", { name: "Open One at full size" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    rerender(
      <LightboxProvider>
        <div />
      </LightboxProvider>,
    );

    await act(() => Promise.resolve());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the open slide when an entry re-registers", async () => {
    const { rerender } = renderGallery([FIRST, SECOND]);

    fireEvent.click(screen.getByRole("button", { name: "Open One at full size" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("[ 01 / 02 ]")).toBeInTheDocument();

    rerender(
      <LightboxProvider>
        <Thumb item={{ ...FIRST, caption: "updated" }} />
        <Thumb item={SECOND} />
      </LightboxProvider>,
    );

    await act(() => Promise.resolve());
    const dialog = screen.getByRole("dialog", { name: "Image viewer" });
    expect(within(dialog).getByRole("img", { name: "One" })).toBeInTheDocument();
    expect(within(dialog).getByText("[ 01 / 02 ]")).toBeInTheDocument();
    expect(within(dialog).getByText("updated")).toBeInTheDocument();
  });
});
