import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LocaleSync } from "./locale-sync";

describe("LocaleSync", () => {
  afterEach(() => {
    cleanup();
    document.documentElement.lang = "";
  });

  it("renders nothing", () => {
    const { container } = render(<LocaleSync lang="de" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("syncs the lang onto the html element", () => {
    render(<LocaleSync lang="de" />);
    expect(document.documentElement.lang).toBe("de");
  });

  it("restores the previous lang on unmount", () => {
    document.documentElement.lang = "en";
    const { unmount } = render(<LocaleSync lang="de" />);
    expect(document.documentElement.lang).toBe("de");
    unmount();
    expect(document.documentElement.lang).toBe("en");
  });

  it("updates the attribute when the lang prop changes", () => {
    const { rerender } = render(<LocaleSync lang="en" />);
    expect(document.documentElement.lang).toBe("en");
    rerender(<LocaleSync lang="de" />);
    expect(document.documentElement.lang).toBe("de");
  });
});
