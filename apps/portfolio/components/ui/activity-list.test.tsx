import { render, screen } from "@testing-library/react";

import type { ActivityEntry } from "@/lib/queries/activity";

import { ActivityList } from "./activity-list";

function entry(overrides: Partial<ActivityEntry> & { id: string }): ActivityEntry {
  return {
    kind: "work",
    title: overrides.id,
    date: "2026-01-02T10:00:00Z",
    ...overrides,
  } as ActivityEntry;
}

describe("ActivityList", () => {
  it("renders nothing at all for an empty source with no label", () => {
    const { container } = render(<ActivityList entries={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the empty label when one is given", () => {
    render(<ActivityList entries={[]} emptyLabel="nothing yet" />);

    expect(screen.getByText("nothing yet")).toBeInTheDocument();
  });

  it("lists one row per entry", () => {
    render(<ActivityList entries={[entry({ id: "a" }), entry({ id: "b" })]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows the day, not the timestamp", () => {
    render(<ActivityList entries={[entry({ id: "a", date: "2026-01-02T10:00:00Z" })]} />);

    const time = screen.getByText("2026-01-02");
    expect(time).toHaveAttribute("datetime", "2026-01-02T10:00:00Z");
  });

  it("links an entry that has an href", () => {
    render(<ActivityList entries={[entry({ id: "a", title: "Some Work", href: "/work/some" })]} />);

    expect(screen.getByRole("link", { name: "Some Work" })).toHaveAttribute("href", "/work/some");
  });

  it("leaves an entry without an href as plain text", () => {
    render(<ActivityList entries={[entry({ id: "a", title: "No Link" })]} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("No Link")).toBeInTheDocument();
  });

  it("marks an off-site href as external but not a site-relative one", () => {
    render(
      <ActivityList
        entries={[
          entry({ id: "a", title: "Outward", href: "https://example.com/x" }),
          entry({ id: "b", title: "Inward", href: "/work/x" }),
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: /Outward/ })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "Inward" })).not.toHaveAttribute("target", "_blank");
  });

  it("withholds the kind column unless asked", () => {
    render(<ActivityList entries={[entry({ id: "a", kind: "film" })]} />);

    expect(screen.queryByText("film")).not.toBeInTheDocument();
  });

  it("labels each kind when the column is on", () => {
    render(
      <ActivityList
        showKind
        entries={[
          entry({ id: "a", kind: "work" }),
          entry({ id: "b", kind: "film" }),
          entry({ id: "c", kind: "record" }),
          entry({ id: "d", kind: "trophy" }),
        ]}
      />,
    );

    expect(screen.getByText("work")).toBeInTheDocument();
    expect(screen.getByText("film")).toBeInTheDocument();
    expect(screen.getByText("disc")).toBeInTheDocument();
    expect(screen.getByText("trph")).toBeInTheDocument();
  });

  it("appends the detail beside the title", () => {
    render(<ActivityList entries={[entry({ id: "a", title: "Album", detail: "by Someone" })]} />);

    expect(screen.getByText(/by Someone/)).toBeInTheDocument();
  });
});
