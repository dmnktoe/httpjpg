import { render, screen } from "@testing-library/react";

import { VendorList } from "./vendor-list";

describe("VendorList", () => {
  it("renders the default vendor catalogue grouped by category", () => {
    render(<VendorList />);
    expect(screen.getByText("✦ External Services Used:")).toBeInTheDocument();
  });

  it("returns null when an empty vendor list is provided", () => {
    const { container } = render(<VendorList vendors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("hides privacy links when showPrivacyLinks is false", () => {
    render(<VendorList showPrivacyLinks={false} />);
    expect(screen.queryByText("Privacy Policy ↗")).toBeNull();
  });
});
