// @vitest-environment node
import { borderRadius } from "./border-radius";
import { colors } from "./colors";
import { opacity } from "./opacity";
import { shadows } from "./shadows";
import { sizes } from "./sizes";
import { spacing } from "./spacing";
import { transitions } from "./transitions";
import { typography } from "./typography";
import { zIndex } from "./z-index";

describe("token maps", () => {
  it("exposes the scales the CSS generator and Panda config read", () => {
    expect(colors.black).toBe("#000000");
    expect(colors.primary[500]).toMatch(/^#/);
    expect(spacing[4]).toBe("1rem");
    expect(borderRadius.none).toBe("0");
    expect(shadows).toBeTypeOf("object");
    expect(opacity[100]).toBeDefined();
    expect(transitions).toBeTypeOf("object");
    expect(sizes).toBeTypeOf("object");
    expect(typography.fontSize).toBeTypeOf("object");
    expect(zIndex).toBeTypeOf("object");
  });
});
