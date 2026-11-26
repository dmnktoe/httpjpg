import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));

import { PostEditLink } from "./post-edit-link";

beforeEach(() => {
  usePathname.mockReturnValue("/feed/20261125-153012-a3f9");
});

afterEach(() => {
  document.cookie = "httpjpg_feed_editor=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
});

describe("PostEditLink", () => {
  it("is nothing for a visitor", () => {
    const { container } = render(<PostEditLink />);

    expect(container).toBeEmptyDOMElement();
  });

  it("leads the author to the composer with the post the router shows", () => {
    document.cookie = "httpjpg_feed_editor=1; path=/";

    render(<PostEditLink />);

    expect(screen.getByRole("link", { name: "[ edit ]" })).toHaveAttribute(
      "href",
      "/feed/upload?post=20261125-153012-a3f9",
    );
  });

  it("is nothing while the router has no path", () => {
    document.cookie = "httpjpg_feed_editor=1; path=/";
    usePathname.mockReturnValue(null);

    const { container } = render(<PostEditLink />);

    expect(container).toBeEmptyDOMElement();
  });
});
