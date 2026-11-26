// @vitest-environment node
import {
  parsePostDate,
  postDay,
  relativePostDate,
  rememberFeedOrigin,
  takeFeedOrigin,
} from "./lib";

const POSTED = Date.UTC(2026, 10, 25, 10, 0);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("postDay", () => {
  it("cuts the day from a Storyblok datetime", () => {
    expect(postDay("2026-11-25 10:00")).toBe("2026-11-25");
    expect(postDay("soon")).toBeUndefined();
    expect(postDay(undefined)).toBeUndefined();
  });
});

describe("parsePostDate", () => {
  it("reads a Storyblok datetime as UTC", () => {
    expect(parsePostDate("2026-11-25 10:00")?.getTime()).toBe(POSTED);
    expect(parsePostDate("2026-11-25T10:00:00.000Z")?.getTime()).toBe(POSTED);
  });

  it("reads a bare day as midnight", () => {
    expect(parsePostDate("2026-11-25")?.getTime()).toBe(Date.UTC(2026, 10, 25));
  });

  it("answers null for anything else", () => {
    expect(parsePostDate("soon")).toBeNull();
    expect(parsePostDate("2026-13-45 10:00")).toBeNull();
    expect(parsePostDate(undefined)).toBeNull();
  });
});

describe("relativePostDate", () => {
  const posted = new Date(POSTED);

  it.each([
    [30_000, "just now"],
    [5 * MINUTE, "5 min ago"],
    [3 * HOUR, "3 h ago"],
    [DAY + HOUR, "yesterday"],
    [4 * DAY + 23 * HOUR, "4 days ago"],
  ])("after %i ms it says %s", (elapsed, label) => {
    expect(relativePostDate(posted, POSTED + elapsed)).toBe(label);
  });

  it("leaves a post older than five days, or dated ahead, to its date", () => {
    expect(relativePostDate(posted, POSTED + 5 * DAY)).toBeNull();
    expect(relativePostDate(posted, POSTED - MINUTE)).toBeNull();
  });
});

describe("feed origin", () => {
  it("is remembered once", () => {
    expect(takeFeedOrigin()).toBe(false);

    rememberFeedOrigin();

    expect(takeFeedOrigin()).toBe(true);
    expect(takeFeedOrigin()).toBe(false);
  });
});
