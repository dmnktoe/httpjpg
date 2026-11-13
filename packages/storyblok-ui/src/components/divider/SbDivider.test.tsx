import { render, screen } from "@testing-library/react";

import { SbDivider } from "./SbDivider";

describe("SbDivider", () => {
  it("renders a divider element", () => {
    const { container } = render(<SbDivider blok={{ _uid: "1", component: "divider" } as never} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders an optional label", () => {
    render(<SbDivider blok={{ _uid: "2", component: "divider", label: "Section" } as never} />);
    expect(screen.getByText("Section")).toBeInTheDocument();
  });

  it("forwards a Storyblok hex color onto the divider", () => {
    render(
      <SbDivider
        blok={
          {
            _uid: "3",
            component: "divider",
            variant: "ascii",
            pattern: "***",
            color: "#D4D4D4",
          } as never
        }
      />,
    );
    expect(screen.getByText("***")).toHaveStyle({ color: "#D4D4D4" });
  });

  it("keeps its own margin on mobile when only a tablet margin is set", () => {
    const { container } = render(
      <SbDivider blok={{ _uid: "4", component: "divider", spacing: "6", mtMd: "8" } as never} />,
    );
    const divider = container.firstChild as HTMLElement;
    expect(divider.style.getPropertyValue("--sb-mt")).toBe("var(--jpg-spacing-6)");
    expect(divider.style.getPropertyValue("--sb-mt-md")).toBe("var(--jpg-spacing-8)");
  });
});
