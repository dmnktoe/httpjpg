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
    thumbSrcSet:
      "https://a.storyblok.com/f/1/x/abc/shot.jpg/m/320x240/filters:quality(75) 320w, " +
      "https://a.storyblok.com/f/1/x/abc/shot.jpg/m/1280x960/filters:quality(75) 1280w",
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

function clickView(view: "grid" | "list") {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(view, "i") }));
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("RelatedWorkGallery", () => {
  it("opens on the list, fetching no thumbnails", () => {
    render(<RelatedWorkGallery items={ITEMS} />);

    expect(screen.getByRole("button", { name: /list/i })).toHaveAttribute("aria-pressed", "true");
    expect(document.querySelector("img")).toBeNull();
  });

  it("puts the view it opens on first", () => {
    render(<RelatedWorkGallery items={ITEMS} />);

    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
      "[=]list",
      "[#]grid",
    ]);
  });

  it("brings the images in for the grid", () => {
    render(<RelatedWorkGallery items={ITEMS} />);

    clickView("grid");

    expect(screen.getByRole("button", { name: /grid/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /list/i })).toHaveAttribute("aria-pressed", "false");
    expect(document.querySelector("img")).toBeInTheDocument();
  });

  it("hands the browser the width candidates in the grid", () => {
    render(<RelatedWorkGallery items={ITEMS} />);

    clickView("grid");
    const image = document.querySelector("img");

    expect(image).toHaveAttribute("srcset", expect.stringContaining("1280w"));
    expect(image).toHaveAttribute("sizes", "(min-width: 768px) 33vw, 100vw");
  });

  it("keeps every neighbour reachable in both views", () => {
    render(<RelatedWorkGallery items={ITEMS} />);

    expect(screen.getByRole("link", { name: /Field Recorder/ })).toHaveAttribute(
      "href",
      "/work/field-recorder",
    );
    expect(screen.getByText("2027")).toBeInTheDocument();

    clickView("grid");

    expect(screen.getByRole("link", { name: /Healform/ })).toBeInTheDocument();
  });

  it("switches back to the list", () => {
    render(<RelatedWorkGallery items={ITEMS} />);

    clickView("grid");
    clickView("list");

    expect(document.querySelector("img")).toBeNull();
  });

  it("remembers the choice", () => {
    render(<RelatedWorkGallery items={ITEMS} />);

    clickView("grid");

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("grid");
  });

  it("restores a stored choice on the next page", async () => {
    window.localStorage.setItem(STORAGE_KEY, "grid");

    render(<RelatedWorkGallery items={ITEMS} />);

    expect(await screen.findByRole("button", { name: /grid/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(document.querySelector("img")).toBeInTheDocument();
  });

  it("ignores a stored value that is not a view", () => {
    window.localStorage.setItem(STORAGE_KEY, "carousel");

    render(<RelatedWorkGallery items={ITEMS} />);

    expect(screen.getByRole("button", { name: /list/i })).toHaveAttribute("aria-pressed", "true");
  });
});
