import { render, screen } from "@testing-library/react";

import { HStack, Stack, VStack } from "./stack";

describe("Stack", () => {
  it("renders children and forwards a ref", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Stack ref={ref} data-testid="stack">
        item
      </Stack>,
    );
    expect(screen.getByText("item")).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("accepts horizontal layout, wrap, and fill flags", () => {
    render(
      <Stack
        direction="horizontal"
        wrap
        fullWidth
        fullHeight
        align="center"
        justify="space-between"
      >
        row
      </Stack>,
    );
    expect(screen.getByText("row")).toBeInTheDocument();
  });
});

describe("VStack / HStack", () => {
  it("render through Stack with a locked direction", () => {
    const vertical = { current: null as HTMLDivElement | null };
    const horizontal = { current: null as HTMLDivElement | null };
    render(
      <>
        <VStack ref={vertical}>down</VStack>
        <HStack ref={horizontal}>across</HStack>
      </>,
    );
    expect(vertical.current).toBeInstanceOf(HTMLDivElement);
    expect(horizontal.current).toBeInstanceOf(HTMLDivElement);
    expect(screen.getByText("down")).toBeInTheDocument();
    expect(screen.getByText("across")).toBeInTheDocument();
  });
});
