import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll } from "vitest";

import { ASCII_EMPTY } from "../ascii-art/banners";
import { WorkList } from "./work-list";

beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.IntersectionObserver;
});

describe("WorkList", () => {
  it("renders the ASCII empty state when works is empty", () => {
    render(<WorkList works={[]} />);
    const art = screen.getByLabelText("No works to display");
    expect(art).toBeInTheDocument();
    expect(art.textContent).toContain("nothing to see here");
  });

  it("does not render empty state when works are present", () => {
    render(
      <WorkList
        works={[
          {
            title: "Test",
            slug: "test",
            images: [{ url: "https://example.com/img.jpg", alt: "test" }],
          },
        ]}
      />,
    );
    expect(screen.queryByLabelText("No works to display")).not.toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("renders header and footer in empty state", () => {
    render(<WorkList works={[]} header={<div>Header</div>} footer={<div>Footer</div>} />);
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(screen.getByLabelText("No works to display")).toBeInTheDocument();
  });

  it("exports ASCII_EMPTY with text and decorative elements", () => {
    expect(ASCII_EMPTY).toContain("nothing to see here");
    expect(ASCII_EMPTY).toContain("∅");
  });
});

describe("WorkList · tag filter", () => {
  const TAGGED = [
    { title: "Alpha", slug: "alpha", images: [], tags: ["React", "Print"] },
    { title: "Beta", slug: "beta", images: [], tags: ["React"] },
    { title: "Gamma", slug: "gamma", images: [] },
  ];

  it("stays out of the way unless asked for", () => {
    render(<WorkList works={TAGGED} />);

    expect(screen.queryByRole("button", { name: /filter/i })).not.toBeInTheDocument();
  });

  it("renders nothing when asked for but no work carries a tag", () => {
    render(<WorkList works={[{ title: "Alpha", slug: "alpha", images: [] }]} showTagFilter />);

    expect(screen.queryByRole("button", { name: /filter/i })).not.toBeInTheDocument();
  });

  it("offers the tags the works actually carry", () => {
    render(<WorkList works={TAGGED} showTagFilter />);

    fireEvent.click(screen.getByRole("button", { name: /filter/i }));

    expect(screen.getByRole("button", { name: /^React/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Print/ })).toBeInTheDocument();
  });

  it("removes the non-matching cards from the tree rather than hiding them", () => {
    render(<WorkList works={TAGGED} showTagFilter />);

    fireEvent.click(screen.getByRole("button", { name: /filter/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Print/ }));

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
    expect(screen.queryByText("Gamma")).not.toBeInTheDocument();
  });

  it("brings every card back when the filter is cleared", () => {
    render(<WorkList works={TAGGED} showTagFilter />);

    fireEvent.click(screen.getByRole("button", { name: /filter/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Print/ }));
    fireEvent.click(screen.getByRole("button", { name: /^all/ }));

    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("filters a grid the same way it filters a stack", () => {
    render(<WorkList works={TAGGED} columns={3} showTagFilter />);

    fireEvent.click(screen.getByRole("button", { name: /filter/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Print/ }));

    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });

  it("drops a selection whose tag the works no longer carry", () => {
    const { rerender } = render(<WorkList works={TAGGED} showTagFilter />);

    fireEvent.click(screen.getByRole("button", { name: /filter/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Print/ }));
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();

    rerender(
      <WorkList
        works={[{ title: "Beta", slug: "beta", images: [], tags: ["React"] }]}
        showTagFilter
      />,
    );

    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("reads and writes the active tag through a URL query param", async () => {
    window.history.replaceState(null, "", "/work?tag=Print");

    render(<WorkList works={TAGGED} showTagFilter tagUrlParam="tag" />);

    await waitFor(() => expect(screen.queryByText("Beta")).not.toBeInTheDocument());
    expect(screen.getByText("Alpha")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^React/ }));

    expect(window.location.search).toBe("?tag=React");
    expect(screen.getByText("Beta")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^all/ }));

    expect(window.location.search).toBe("");
  });
});
