import { render, screen } from "@testing-library/react";

import { CLOUDFLARE_LOGO_SRC, CloudflareLogo } from "./cloudflare-logo";

describe("CloudflareLogo", () => {
  it("announces itself as Cloudflare", () => {
    render(<CloudflareLogo />);

    expect(screen.getByRole("img", { name: "Cloudflare" })).toBeInTheDocument();
  });

  it("points at the classic lockup in the site public folder", () => {
    render(<CloudflareLogo />);

    expect(screen.getByRole("img", { name: "Cloudflare" })).toHaveAttribute(
      "src",
      CLOUDFLARE_LOGO_SRC,
    );
  });

  it("renders at the default height", () => {
    render(<CloudflareLogo />);

    expect(screen.getByRole("img", { name: "Cloudflare" })).toHaveStyle({ height: "12px" });
  });

  it("accepts a custom height", () => {
    render(<CloudflareLogo height="19px" />);

    expect(screen.getByRole("img", { name: "Cloudflare" })).toHaveStyle({ height: "19px" });
  });
});
