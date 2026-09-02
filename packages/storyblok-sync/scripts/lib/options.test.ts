// @vitest-environment node
import { inlineOptions, OVERLAY_PATTERN_OPTIONS } from "./options";

describe("inlineOptions", () => {
  it("mirrors the token maps editors pick from", () => {
    expect(inlineOptions.width.length).toBeGreaterThan(0);
    expect(inlineOptions.aspectRatio.some((o) => o.value === "16/9")).toBe(true);
    expect(inlineOptions.gridColumn[0]).toMatchObject({ value: expect.any(String) });
    expect(inlineOptions.fontSize.length).toBeGreaterThan(0);
    expect(inlineOptions.fontWeight.length).toBeGreaterThan(0);
    expect(OVERLAY_PATTERN_OPTIONS.some((o) => o.value === "none")).toBe(true);
  });
});
