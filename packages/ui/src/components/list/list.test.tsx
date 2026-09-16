import { render, screen } from "@testing-library/react";

import { ListItem } from "./list-item";
import { OrderedList } from "./ordered-list";
import { UnorderedList } from "./unordered-list";

describe("UnorderedList", () => {
  it("renders as a ul by default and forwards a ref", () => {
    const ref = { current: null as HTMLUListElement | null };
    render(
      <UnorderedList ref={ref}>
        <ListItem>one</ListItem>
      </UnorderedList>,
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(ref.current?.tagName).toBe("UL");
  });

  it("accepts size, marker, spacing, and a custom element", () => {
    render(
      <UnorderedList as="div" size="lg" listStyle="none" spacing="0" className="extra">
        <ListItem>plain</ListItem>
      </UnorderedList>,
    );
    expect(screen.getByText("plain").closest(".extra")).not.toBeNull();
  });
});

describe("OrderedList", () => {
  it("renders as an ol by default", () => {
    render(
      <OrderedList>
        <ListItem>first</ListItem>
      </OrderedList>,
    );
    expect(screen.getByRole("list").tagName).toBe("OL");
  });

  it("accepts alpha and roman markers", () => {
    const { rerender } = render(
      <OrderedList listStyle="lower-alpha" size="md" spacing="4">
        <ListItem>a</ListItem>
      </OrderedList>,
    );
    expect(screen.getByText("a")).toBeInTheDocument();

    rerender(
      <OrderedList listStyle="upper-roman" as="div">
        <ListItem>i</ListItem>
      </OrderedList>,
    );
    expect(screen.getByText("i")).toBeInTheDocument();
  });
});

describe("ListItem", () => {
  it("renders as an li and can switch element and size", () => {
    const ref = { current: null as HTMLLIElement | null };
    const { rerender } = render(
      <ListItem ref={ref} size="lg">
        item
      </ListItem>,
    );
    expect(ref.current?.tagName).toBe("LI");

    rerender(
      <ListItem as="div" size="md">
        item
      </ListItem>,
    );
    expect(screen.getByText("item").tagName).toBe("DIV");
  });
});
