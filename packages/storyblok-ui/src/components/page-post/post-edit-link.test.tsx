import { render, screen } from "@testing-library/react";

import { PostEditLink } from "./post-edit-link";

afterEach(() => {
  document.cookie = "httpjpg_feed_editor=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  window.history.replaceState(null, "", "/");
});

describe("PostEditLink", () => {
  it("is nothing for a visitor", () => {
    const { container } = render(<PostEditLink />);

    expect(container).toBeEmptyDOMElement();
  });

  it("leads the author to the composer with this post", () => {
    document.cookie = "httpjpg_feed_editor=1; path=/";
    window.history.replaceState(null, "", "/feed/20261125-153012-a3f9");

    render(<PostEditLink />);

    expect(screen.getByRole("link", { name: "[ edit ]" })).toHaveAttribute(
      "href",
      "/feed/compose?post=20261125-153012-a3f9",
    );
  });
});
