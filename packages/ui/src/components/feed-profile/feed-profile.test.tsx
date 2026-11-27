import { render, screen } from "@testing-library/react";

import { FeedProfile } from "./feed-profile";

describe("FeedProfile", () => {
  it("shows the name, the picture and the line under it", () => {
    const { container } = render(
      <FeedProfile name="httpjpg" avatarSrc="/me.jpg" css={{ mb: "8" }}>
        photo dumps
      </FeedProfile>,
    );

    expect(screen.getByText("httpjpg")).toBeInTheDocument();
    expect(screen.getByText("photo dumps")).toBeInTheDocument();
    expect(container.querySelector("[data-feed-profile-photo] img")).toHaveAttribute(
      "src",
      "/me.jpg",
    );
    expect(container.firstElementChild?.className).toContain("jpg-mb_8");
  });

  it("lists its counters as terms and values", () => {
    render(<FeedProfile name="httpjpg" stats={[{ value: "12", label: "posts" }]} />);

    expect(screen.getByRole("term")).toHaveTextContent("posts");
    expect(screen.getByRole("definition")).toHaveTextContent("12");
  });

  it("has no counters or line unless given", () => {
    const { container } = render(<FeedProfile name="httpjpg" />);

    expect(container.querySelector("dl")).toBeNull();
  });

  it("stands in the first letter of the name without a picture", () => {
    const { container } = render(<FeedProfile name="httpjpg" />);

    expect(container.querySelector("[data-feed-profile-photo] img")).toBeNull();
    expect(container.querySelector("[data-feed-profile-photo]")).toHaveTextContent("h");
  });
});
