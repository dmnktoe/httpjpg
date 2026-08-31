import { formatGlyphDigits, formatTime, formatYear } from "./format";

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
    expect(formatYear("2027-13-45 00:00")).toBeNull();
  });

  it("keeps the authored year for wall-clock datetimes", () => {
    expect(formatYear("2027-01-01 00:00")).toBe("2027");
    expect(formatYear("2027-01-01T00:00")).toBe("2027");
    expect(formatYear("2027-01-01 00:00:00")).toBe("2027");
  });

  it("respects an explicit timezone offset", () => {
    expect(formatYear("2027-01-01T00:00:00Z")).toBe("2027");
    expect(formatYear("2027-01-01T00:00:00+01:00")).toBe("2026");
  });
});

describe("formatGlyphDigits", () => {
  it("maps every digit onto its lookalike", () => {
    expect(formatGlyphDigits(1234567890)).toBe("\u{1D7D9}ϩӠ५ƼϬ7\u{1D7E0}९⊘");
  });

  it("keeps multi-digit counts in order", () => {
    expect(formatGlyphDigits(0)).toBe("⊘");
    expect(formatGlyphDigits(12)).toBe("\u{1D7D9}ϩ");
  });
});

describe("formatTime", () => {
  it("pads the seconds", () => {
    expect(formatTime(65)).toBe("1:05");
  });

  it("falls back to zero for a length that is not a number yet", () => {
    expect(formatTime(Number.NaN)).toBe("0:00");
    expect(formatTime(-1)).toBe("0:00");
  });
});
