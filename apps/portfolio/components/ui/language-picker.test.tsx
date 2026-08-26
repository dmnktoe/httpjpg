import { render, screen } from "@testing-library/react";

import { LanguagePicker } from "./language-picker";

describe("LanguagePicker", () => {
  it("marks the active locale and links the other", () => {
    render(<LanguagePicker locale="en" slug="cv" />);

    expect(screen.getByRole("navigation", { name: "Language" })).toBeInTheDocument();
    expect(screen.getByText("EN")).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "EN" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DE" })).toHaveAttribute("href", "/de/cv");
  });

  it("points back at the unprefixed English path from German", () => {
    render(<LanguagePicker locale="de" slug="cv" />);

    expect(screen.getByText("DE")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "EN" })).toHaveAttribute("href", "/cv");
  });

  it("stamps hreflang on the inactive option", () => {
    render(<LanguagePicker locale="en" slug="cv" />);

    expect(screen.getByRole("link", { name: "DE" })).toHaveAttribute("hrefLang", "de");
  });
});
