import { formatYear } from "./format";

describe("formatYear", () => {
  it("returns null for a missing date", () => {
    expect(formatYear(undefined)).toBeNull();
    expect(formatYear("")).toBeNull();
  });

  it("returns the year for a valid date", () => {
    expect(formatYear("2024-06-12")).toBe("2024");
  });

  it("uses UTC so date-only strings never shift a year", () => {
    expect(formatYear("2024-01-01")).toBe("2024");
  });

  it("returns null for an invalid date", () => {
    expect(formatYear("not a date")).toBeNull();
  });
});
