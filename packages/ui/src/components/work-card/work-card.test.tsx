import { render, screen } from "@testing-library/react";
import { beforeAll } from "vitest";

import { WorkCard } from "./work-card";

beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.IntersectionObserver;
});

const images = [{ url: "https://example.com/img.jpg", alt: "cover" }];

describe("WorkCard", () => {
  it("renders title, description, tags, and a slug link", () => {
    render(
      <WorkCard
        title="Outlet"
        description="A shop"
        slug="outlet"
        images={images}
        tags={["React"]}
        date="2024-01-01"
      />,
    );
    expect(screen.getByText("Outlet")).toBeInTheDocument();
    expect(screen.getByText("A shop")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "outlet" })).toHaveAttribute("href", "/work/outlet");
  });

  it("hides the description in compact variant", () => {
    render(
      <WorkCard
        title="Outlet"
        description="A shop"
        slug="outlet"
        images={images}
        variant="compact"
      />,
    );
    expect(screen.getByText("Outlet")).toBeInTheDocument();
    expect(screen.queryByText("A shop")).not.toBeInTheDocument();
  });

  it("keeps the description in featured variant and honours baseUrl", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <WorkCard
        ref={ref}
        title="Outlet"
        description="A shop"
        slug="outlet"
        images={images}
        variant="featured"
        baseUrl="/projects"
      />,
    );
    expect(screen.getByText("A shop")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "outlet" })).toHaveAttribute(
      "href",
      "/projects/outlet",
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
