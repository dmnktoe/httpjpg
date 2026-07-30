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

    it("compacts a single gap value for mobile and keeps it from md up", () => {
      const classes = listClasses(<WorkList works={works} gap={24} />);
      expect(classes).toContain("gap_12");
      expect(classes).toContain("md:gap_24");
    });

    it("uses an authored breakpoint cascade verbatim", () => {
      const classes = listClasses(<WorkList works={works} gap={{ base: 4, md: 16, lg: 24 }} />);
      expect(classes).toContain("gap_4");
      expect(classes).toContain("md:gap_16");
      expect(classes).toContain("lg:gap_24");
    });

    it("derives a mobile gap when only a larger breakpoint is authored", () => {
      const classes = listClasses(<WorkList works={works} gap={{ lg: 24 }} />);
      expect(classes).toContain("gap_12");
      expect(classes).toContain("lg:gap_24");
    });

    it("compacts the divider spacing for mobile", () => {
      const { container } = render(
        <WorkList works={works} showDividers dividerSpacing={20} gap={4} />,
      );
      const divider = container.querySelector("[data-work-list] > div > div:last-child");
      expect(divider?.className).toContain("mt_10");
      expect(divider?.className).toContain("md:mt_20");
      expect(divider?.className).toContain("mb_10");
      expect(divider?.className).toContain("md:mb_20");
    });
  });
});
