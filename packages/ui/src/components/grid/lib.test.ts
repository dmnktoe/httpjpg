import { carryTrack, gridTemplate, trackLine } from "./lib";

describe("gridTemplate", () => {
  it("keeps tracks from growing past the grid", () => {
    expect(gridTemplate(3)).toBe("repeat(3, minmax(0, 1fr))");
    expect(gridTemplate("auto")).toBe("repeat(auto-fit, minmax(200px, 1fr))");
  });
});

describe("trackLine", () => {
  it.each([
    [{}, "auto"],
    [{ span: 4 }, "span 4"],
    [{ span: "full" as const }, "1 / -1"],
    [{ start: 2, span: "full" as const }, "2 / -1"],
    [{ start: 3 }, "3"],
    [{ start: 3, span: 4 }, "3 / span 4"],
    [{ start: 2, end: 9, span: 4 }, "2 / 9"],
    [{ end: 5 }, "auto / 5"],
  ])("%o → %s", (track, line) => {
    expect(trackLine(track)).toBe(line);
  });
});

describe("carryTrack", () => {
  it("returns the track below when nothing is set", () => {
    expect(carryTrack({ start: 2, span: 3 }, {})).toEqual({ start: 2, span: 3 });
  });

  it("keeps the start when only the span changes", () => {
    expect(carryTrack({ start: 3, span: 4 }, { span: 6 })).toEqual({
      start: 3,
      span: 6,
      end: undefined,
    });
  });

  it("turns an explicit end into a width when only the start moves", () => {
    expect(carryTrack({ start: 1, end: 4 }, { start: 6 })).toEqual({
      start: 6,
      span: 3,
      end: undefined,
    });
  });
});
