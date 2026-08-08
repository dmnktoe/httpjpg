// @vitest-environment node

import { colors } from "@httpjpg/tokens/colors";

import { toAnsi } from "./color";

describe("toAnsi", () => {
  it("splits a hex token into its truecolor components", () => {
    expect(toAnsi("#EF4444")).toBe("38;2;239;68;68");
    expect(toAnsi("#000000")).toBe("38;2;0;0;0");
    expect(toAnsi("#FFFFFF")).toBe("38;2;255;255;255");
  });

  it("accepts a hex value without the leading hash", () => {
    expect(toAnsi("3B82F6")).toBe(toAnsi("#3B82F6"));
  });

  it("derives the CLI palette from the design tokens, not from literals", () => {
    expect(toAnsi(colors.danger[500])).toBe("38;2;239;68;68");
    expect(toAnsi(colors.success[500])).toBe("38;2;34;197;94");
    expect(toAnsi(colors.accent[500])).toBe("38;2;132;204;22");
    expect(toAnsi(colors.primary[500])).toBe("38;2;59;130;246");
  });
});
