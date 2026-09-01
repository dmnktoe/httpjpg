import { render, screen } from "@testing-library/react";

import { CloudflareStatus } from "./cloudflare-status";

describe("CloudflareStatus", () => {
  it("renders the attribution line with the Cloudflare lockup", () => {
    render(<CloudflareStatus />);

    expect(screen.getByText("backed & secured by")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Cloudflare" })).toBeInTheDocument();
  });

  it("links the whole line out to Cloudflare", () => {
    render(<CloudflareStatus />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://www.cloudflare.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
