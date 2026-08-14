import { render, screen } from "@testing-library/react";

import { RelatedWork } from "./related-work";

vi.mock("@httpjpg/ui", async () => {
  const actual = await vi.importActual<typeof import("@httpjpg/ui")>("@httpjpg/ui");
  return actual;
});

const ITEM = {
  id: "1",
  title: "Field Recorder",
  href: "/work/field-recorder",
  date: "2024-01-10",
  sharedTags: ["Swift", "iOS"],
};

describe("RelatedWork", () => {
  it("renders nothing when the story has neither tags nor neighbours", () => {
    const { container } = render(<RelatedWork tags={[]} related={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("explains the emptiness while previewing instead of vanishing", () => {
    render(<RelatedWork tags={[]} related={[]} isPreview />);

    expect(screen.getByLabelText("Related work diagnostics")).toHaveTextContent(/no work tags/i);
  });

  it("keeps the hint out of the published page", () => {
    render(<RelatedWork tags={["Swift"]} related={[]} isPreview />);

    expect(screen.queryByLabelText("Related work diagnostics")).not.toBeInTheDocument();
  });

  it("renders the story's own tags", () => {
    render(<RelatedWork tags={["Swift", "iOS"]} related={[]} />);

    expect(screen.getByText("Swift")).toBeInTheDocument();
    expect(screen.getByText("iOS")).toBeInTheDocument();
  });

  it("renders a neighbour with its year and the tags it shares", () => {
    render(<RelatedWork tags={["Swift"]} related={[ITEM]} />);

    expect(screen.getByRole("link", { name: /Field Recorder/ })).toHaveAttribute(
      "href",
      "/work/field-recorder",
    );
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("Swift · iOS")).toBeInTheDocument();
  });

  it("shows the tag row on its own when nothing shares a tag", () => {
    render(<RelatedWork tags={["Swift"]} related={[]} />);

    expect(screen.getByText("tagged")).toBeInTheDocument();
    expect(screen.queryByText("related")).not.toBeInTheDocument();
  });
});
