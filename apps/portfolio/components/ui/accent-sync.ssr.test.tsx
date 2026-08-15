// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@httpjpg/spotify", () => ({
  extractVibrantColor: vi.fn(),
}));

import { AccentSync } from "./accent-sync";

describe("AccentSync (server)", () => {
  it("renders to empty markup without a useLayoutEffect warning", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const html = renderToString(<AccentSync imageUrl="https://example.com/a.jpg" />);

    expect(html).toBe("");
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
