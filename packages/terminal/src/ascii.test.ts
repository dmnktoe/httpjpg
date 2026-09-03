// @vitest-environment node

import {
  ASCII_ARROW,
  ASCII_DIVIDER_DOTS,
  ASCII_DIVIDER_STARS,
  ASCII_SPARKLES,
  ASCII_TAPE,
  MARK_DONE,
  MARK_FAIL,
  MARK_STEP,
  MARK_WARN,
} from "./ascii";

describe("ascii marks", () => {
  it("exports the CLI glyphs", () => {
    expect(ASCII_ARROW).toBe("⇝");
    expect(ASCII_SPARKLES.length).toBeGreaterThan(0);
    expect(ASCII_DIVIDER_STARS).toContain("☆");
    expect(ASCII_DIVIDER_DOTS).toContain("─");
    expect(ASCII_TAPE).toContain("▰");
    expect(MARK_STEP).toBe("·");
    expect(MARK_DONE).toBe("✦");
    expect(MARK_WARN).toBe("!");
    expect(MARK_FAIL).toBe("∅");
  });
});
