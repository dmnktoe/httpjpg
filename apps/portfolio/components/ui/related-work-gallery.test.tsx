import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach } from "vitest";

import { RelatedWorkGallery } from "./related-work-gallery";

const STORAGE_KEY = "httpjpg:related-work-view";

const ITEMS = [
  {
    id: "1",
    title: "Field Recorder",
    href: "/work/field-recorder",
    date: "2024-01-10",
    thumb: "https://a.storyblok.com/f/1/x/abc/shot.jpg/m/1280x960/filters:quality(75)",
    sharedTags: ["Swift", "iOS"],
  },
  {
    id: "2",
    title: "Healform",
    href: "/work/healform",
    date: "2027-04-02",
    sharedTags: ["Docker"],
  },
];

beforeEach(() => {
  window.localStorage.clear();
});

describe("RelatedWorkGallery", () => {
  it("opens on the grid with its images", () => {
    render(<RelatedWorkGallery items={ITEMS} />);

    expect(screen.getByRole("button", { name: /grid/i })).toHaveAttribute("aria-pressed", "true");
    expect(document.querySelector("img")).toBeInTheDocument();
  });

  it("drops the images for the list", () => {
    render(<RelatedWorkGallery items={ITEMS} />);

    fireEvent.click(screen.getByRole("button", { name: /list/i }));

    expect(screen.getByRole("button", { name: /list/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /grid/i })).toHaveAttribute("aria-pressed", "false");
    expect(document.querySelector("img")).toBeNull();
  });

  it("keeps every neighbour reachable in both views", () => {
    render(<RelatedWorkGallery items={ITEMS} />);

    fireEvent.click(screen.getByRole("button", { name: /list/i }));

    expect(screen.getByRole("link", { name: /Field Recorder/ })).toHaveAttribute(
      "href",
      "/work/field-recorder",
    );
    expect(screen.getByRole("link", { name: /Healform/ })).toBeInTheDocument();
    expect(screen.getByText("2027")).toBeInTheDocument();
  });

  it("switches back to the grid", () => {
    render(<RelatedWorkGallery items={ITEMS} />);

    fireEvent.click(screen.getByRole("button", { name: /list/i }));
    fireEvent.click(screen.getByRole("button", { name: /grid/i }));

    expect(document.querySelector("img")).toBeInTheDocument();
  });

  it("remembers the choice", () => {
    render(<RelatedWorkGallery items={ITEMS} />);

    fireEvent.click(screen.getByRole("button", { name: /list/i }));

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("list");
  });

  it("restores a stored choice on the next page", async () => {
    window.localStorage.setItem(STORAGE_KEY, "list");

    render(<RelatedWorkGallery items={ITEMS} />);

    expect(await screen.findByRole("button", { name: /list/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(document.querySelector("img")).toBeNull();
  });

  it("ignores a stored value that is not a view", () => {
    window.localStorage.setItem(STORAGE_KEY, "carousel");

    render(<RelatedWorkGallery items={ITEMS} />);

    expect(screen.getByRole("button", { name: /grid/i })).toHaveAttribute("aria-pressed", "true");
  });
});
