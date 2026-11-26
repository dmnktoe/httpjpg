// @vitest-environment node
import { localInputToIso, storyblokToLocalInput, toLocalInput } from "./date";

describe("storyblokToLocalInput", () => {
  it("turns a UTC datetime into the local value of a datetime-local input", () => {
    const expected = toLocalInput(new Date(Date.UTC(2026, 10, 25, 10, 0)));

    expect(storyblokToLocalInput("2026-11-25 10:00")).toBe(expected);
    expect(storyblokToLocalInput("2026-11-25T10:00:00.000Z")).toBe(expected);
  });

  it("is empty for anything else", () => {
    expect(storyblokToLocalInput("")).toBe("");
    expect(storyblokToLocalInput("soon")).toBe("");
  });
});

describe("toLocalInput", () => {
  it("pads every part", () => {
    expect(toLocalInput(new Date(2026, 0, 2, 3, 4))).toBe("2026-01-02T03:04");
  });
});

describe("localInputToIso", () => {
  it("reads the input as local time", () => {
    expect(localInputToIso("2026-01-02T03:04")).toBe(new Date(2026, 0, 2, 3, 4).toISOString());
  });

  it("is undefined for an empty or broken value", () => {
    expect(localInputToIso("")).toBeUndefined();
    expect(localInputToIso("nope")).toBeUndefined();
  });
});
