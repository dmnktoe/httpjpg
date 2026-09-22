import { render, screen } from "@testing-library/react";

import { PageBadge, PageBadgeProvider } from "./page-badge";

const HREF = "https://external.dev";
const EDIT = "https://app.storyblok.com/#/me/spaces/7/stories/0/0/9";

describe("PageBadge", () => {
  it("renders the work pill when there is no host", () => {
    render(<PageBadge href={HREF} accentColor="#ec6839" />);

    expect(screen.getByRole("link", { name: /open external preview/ })).toHaveAttribute(
      "href",
      HREF,
    );
    expect(screen.queryByRole("status", { name: /preview mode/i })).toBeNull();
  });

  it("renders work and editor pills in one cluster under a provider", () => {
    render(
      <PageBadgeProvider>
        <PageBadge href={HREF} editHref={EDIT} accentColor="#ec6839" />
      </PageBadgeProvider>,
    );

    expect(document.body.querySelectorAll("[data-page-badge]")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /open external preview/ })).toHaveAttribute(
      "href",
      HREF,
    );
    expect(screen.getByRole("link", { name: "Edit in Storyblok" })).toHaveAttribute("href", EDIT);
    expect(
      screen
        .getByRole("link", { name: /open external preview/ })
        .style.getPropertyValue("--work-accent"),
    ).toBe("#EC6839");
    expect(
      screen.getByRole("status", { name: /preview mode/i }).style.getPropertyValue("--work-accent"),
    ).toBe("");
  });
});
