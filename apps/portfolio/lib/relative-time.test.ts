// @vitest-environment node
import { formatRelativeTime } from "./relative-time";

const NOW = Date.parse("2026-08-08T12:00:00Z");

describe("formatRelativeTime", () => {
  it("returns null for an unparseable timestamp", () => {
    expect(formatRelativeTime("not-a-date", NOW)).toBeNull();
  });

  it("reports anything under a minute as just now", () => {
    expect(formatRelativeTime("2026-08-08T11:59:30Z", NOW)).toBe("just now");
  });

  it("reports a future timestamp as just now", () => {
    expect(formatRelativeTime("2026-08-09T12:00:00Z", NOW)).toBe("just now");
  });

  it("counts whole minutes below an hour", () => {
    expect(formatRelativeTime("2026-08-08T11:30:00Z", NOW)).toBe("30m ago");
    expect(formatRelativeTime("2026-08-08T11:01:00Z", NOW)).toBe("59m ago");
  });

  it("counts whole hours below a day", () => {
    expect(formatRelativeTime("2026-08-08T09:00:00Z", NOW)).toBe("3h ago");
    expect(formatRelativeTime("2026-08-07T13:00:00Z", NOW)).toBe("23h ago");
  });

  it("counts whole days beyond that", () => {
    expect(formatRelativeTime("2026-08-07T12:00:00Z", NOW)).toBe("1d ago");
    expect(formatRelativeTime("2026-07-08T12:00:00Z", NOW)).toBe("31d ago");
  });
});
