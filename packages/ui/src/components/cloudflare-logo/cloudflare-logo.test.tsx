import { render, screen } from "@testing-library/react";

import { CloudflareLogo } from "./cloudflare-logo";

describe("CloudflareLogo", () => {
  it("announces itself as Cloudflare", () => {
    render(<CloudflareLogo />);

    expect(screen.getByRole("img", { name: "Cloudflare" })).toBeInTheDocument();
  });

  it("renders at the default height", () => {
    render(<CloudflareLogo />);

    expect(screen.getByRole("img", { name: "Cloudflare" })).toHaveStyle({ height: "12px" });
  });

  it("accepts a custom height", () => {
    render(<CloudflareLogo height="16px" />);

    expect(screen.getByRole("img", { name: "Cloudflare" })).toHaveStyle({ height: "16px" });
  });
});
