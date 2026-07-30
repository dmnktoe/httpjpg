import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
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

  describe("spacing rhythm", () => {
    const works = [
      { title: "A", slug: "a", images: [{ url: "https://example.com/a.jpg", alt: "a" }] },
      { title: "B", slug: "b", images: [{ url: "https://example.com/b.jpg", alt: "b" }] },
    ];

    function listClasses(ui: ReactElement): string {
      const { container } = render(ui);
      return container.querySelector("[data-work-list]")?.className ?? "";
    }

    it("applies a single gap value at every breakpoint", () => {
      const classes = listClasses(<WorkList works={works} gap={24} />);
      expect(classes).toContain("gap_24");
      expect(classes).not.toContain("md:gap_");
    });

    it("applies an authored breakpoint cascade", () => {
      const classes = listClasses(<WorkList works={works} gap={{ base: 4, md: 16, lg: 24 }} />);
      expect(classes).toContain("gap_4");
      expect(classes).toContain("md:gap_16");
      expect(classes).toContain("lg:gap_24");
    });

    it("renders dividers as list siblings so the gap applies on both sides", () => {
      const { container } = render(<WorkList works={works} gap={4} showDividers />);
      const list = container.querySelector("[data-work-list]");
      const children = [...(list?.children ?? [])];
      expect(children).toHaveLength(3);
      expect(children[1].hasAttribute("data-work-divider")).toBe(true);
      expect(children[1].className).toContain("mt_0");
      expect(children[1].className).toContain("mb_0");
    });

    it("does not render a trailing divider", () => {
      const { container } = render(<WorkList works={works} gap={4} showDividers />);
      const list = container.querySelector("[data-work-list]");
      expect(list?.lastElementChild?.hasAttribute("data-work-divider")).toBe(false);
      expect(container.querySelectorAll("[data-work-divider]")).toHaveLength(1);
    });
  });
});
