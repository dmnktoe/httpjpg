// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ThemeSync } from "./theme-sync";

describe("ThemeSync (server)", () => {
  it("renders to empty markup without a useLayoutEffect warning", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const html = renderToString(<ThemeSync theme="dark" />);

    expect(html).toBe("");
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
