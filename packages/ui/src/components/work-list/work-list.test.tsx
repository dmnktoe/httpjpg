import { render, screen } from "@testing-library/react";
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
