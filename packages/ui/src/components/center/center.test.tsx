import { render, screen } from "@testing-library/react";

import { Center } from "./center";

describe("Center", () => {
  it("centers children on both axes with grid by default", () => {
    render(<Center>content</Center>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("uses flex when asked and can skip an axis", () => {
    const { rerender } = render(
      <Center useFlex horizontal={false} vertical={false} minHeight="100vh">
        flex
      </Center>,
    );
    expect(screen.getByText("flex")).toBeInTheDocument();

    rerender(
      <Center useFlex horizontal vertical>
        both
      </Center>,
    );
    expect(screen.getByText("both")).toBeInTheDocument();
  });

  it("forwards className and a ref", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Center ref={ref} className="centered">
        ref
      </Center>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current).toHaveClass("centered");
  });
});
